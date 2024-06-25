// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

// Importing the ReentrancyGuard for security against re-entrancy attacks and the custom ERC20 token contract
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./TokenERC20.sol";

/**
 * @title Agreement Contract for Energy Trading
 * @dev Handles the agreement between a consumer and producer for energy trading, including payment and incident management.
 */
contract Agreement is ReentrancyGuard {
    // Instance of the token contract to manage payments
    TokenContract public tokenContract;

    // Consumer and producer addresses involved in the agreement
    address public consumer;
    address public producer;

    // Authorization for smart meters to report energy sent/received
    mapping(address => bool) public smartMeterConsumer;
    mapping(address => bool) public smartMeterProducer;

    // Agreement details including price and total energy to be exchanged
    uint256 public priceKwH;
    uint256 public totalEnergy;
    uint256 public energyProvided = 0; // Total energy reported as provided by producer
    uint256 public energyReceived = 0; // Total energy reported as received by consumer

    // A fixed platform fee charged for facilitating the agreement
    uint256 public immutable feePlatform = 10; // Fee in percentage

    bool producerHasStarted = false; // Flag to indicate if the producer has started to send energy
    // Incident management variables
    bool public incidentActive = false; // Flag to indicate if there's an ongoing incident
    bool public consumerConfirmed = false; // Consumer's confirmation in resolving an incident
    bool public producerConfirmed = false; // Producer's confirmation in resolving an incident

    // Struct to store details of an incident
    struct Incident {
        uint256 discrepancyAmount; // The amount of energy discrepancy reported
        address reporter; // The address that reported the incident
    }
    Incident public currentIncident; // The current active incident

    // Modifiers for function access control
    modifier onlyConsumer() {
        require(msg.sender == consumer);
        _;
    }

    modifier onlyProducer() {
        require(msg.sender == producer);
        _;
    }

    modifier onlySmartMeterConsumer() {
        require(smartMeterConsumer[msg.sender]);
        _;
    }

    modifier onlySmartMeterProducer() {
        require(smartMeterProducer[msg.sender]);
        _;
    }

    // Events for logging contract activities
    event EnergySent(address indexed smartMeter, uint256 amount);
    event EnergyReceived(address indexed smartMeter, uint256 amount);
    event PaymentClaimed(
        address indexed producer,
        uint256 amountPaid,
        uint256 amountReturned
    );
    event IncidentReported(address indexed reporter, uint256 discrepancy);
    event IncidentResolved();
    event ExchangeFinalized(
        address indexed consumer,
        address indexed producer,
        uint256 energyExchanged,
        uint256 totalPaid,
        uint256 totalReturned
    );

    /**
     * @dev Constructor to set up the agreement details and authorized smart meters
     * @param _tokenContract Address of the token contract for payments
     * @param _consumer Address of the consumer in the agreement
     * @param _producer Address of the producer in the agreement
     * @param _priceKwH Agreed price per kWh
     * @param _totalEnergy Total energy to be exchanged
     * @param _smConsumers Array of consumer smart meter addresses
     * @param _smProducers Array of producer smart meter addresses
     */
    constructor(
        address _tokenContract,
        address _consumer,
        address _producer,
        uint256 _priceKwH,
        uint256 _totalEnergy,
        address[] memory _smConsumers,
        address[] memory _smProducers
    ) {
        tokenContract = TokenContract(_tokenContract);
        consumer = _consumer;
        producer = _producer;
        priceKwH = _priceKwH;
        totalEnergy = _totalEnergy;

        // Authorizing smart meters
        for (uint256 i = 0; i < _smConsumers.length; i++) {
            smartMeterConsumer[_smConsumers[i]] = true;
        }
        for (uint256 i = 0; i < _smProducers.length; i++) {
            smartMeterProducer[_smProducers[i]] = true;
        }
    }

    /**
     * @dev Allows the producer to notify that the energy transfer is going to start
     */
    function reportStartTransfer() public {
        require(
            msg.sender == producer || smartMeterProducer[msg.sender],
            "Not Allowed"
        );
        producerHasStarted = true;
    }

    /**
     * @dev Allows the producer's smart meter to report energy provided
     * @param amount Amount of energy provided
     */
    function reportEnergyProvided(
        uint256 amount
    ) public onlySmartMeterProducer nonReentrant {
        require(consumerHasPaid(), "Consumer has not paid");
        energyProvided += amount;
        if (
            (energyProvided >= totalEnergy &&
                energyProvided == energyReceived) ||
            (energyProvided < totalEnergy &&
                energyProvided > 0 &&
                energyProvided == energyReceived)
        ) {
            finalizeExchange();
        } else {
            emit EnergySent(msg.sender, amount);
        }
    }

    /**
     * @dev Allows the consumer's smart meter to report energy received
     * @param amount Amount of energy received
     */
    function reportEnergyReceived(
        uint256 amount
    ) public onlySmartMeterConsumer nonReentrant {
        require(consumerHasPaid(), "Consumer has not paid");
        energyReceived += amount;
        if (
            (energyReceived >= totalEnergy &&
                energyReceived == energyProvided) ||
            (energyReceived < totalEnergy &&
                energyReceived > 0 &&
                energyProvided == energyReceived)
        ) {
            finalizeExchange();
        } else {
            emit EnergyReceived(msg.sender, amount);
        }
    }

    /**
     * @dev Allows consumer or producer to report an incident if there's a discrepancy in energy exchange
     */
    function reportIncident() public {
        require(
            msg.sender == consumer || msg.sender == producer,
            "Caller not authorized to report incident"
        );
        require(!incidentActive, "An incident is already active");
        require(
            energyProvided != energyReceived,
            "No discrepancy in energy reported"
        );

        uint256 discrepancy = abs(int256(totalEnergy) - int256(energyProvided));
        currentIncident = Incident(discrepancy, msg.sender);
        incidentActive = true;
        emit IncidentReported(msg.sender, discrepancy);
    }

    /**
     * @dev Resolves the current active incident based on updated energy amounts
     * @param energy_amount The corrected energy amount agreed upon by both parties
     */
    function resolveIncident(uint256 energy_amount) public nonReentrant {
        require(incidentActive, "No active incident to resolve");
        require(
            msg.sender == consumer || msg.sender == producer,
            "Caller not authorized to resolve incident"
        );

        // Updating energy amounts and confirmations based on caller
        if (msg.sender == consumer) {
            energyReceived = energy_amount;
            consumerConfirmed = true;
        } else {
            energyProvided = energy_amount;
            producerConfirmed = true;
        }

        // Resolving the incident if both parties have confirmed and amounts match
        if (
            consumerConfirmed &&
            producerConfirmed &&
            energyProvided == energyReceived
        ) {
            incidentActive = false;
            producerConfirmed = false;
            consumerConfirmed = false;
            finalizeExchange();
        }
    }

    /**
     * @dev Allows the consumer to cancel the Agreement
     */
    function cancelAgreement() public nonReentrant {
        require(msg.sender == consumer, "Not Allowed");
        require(
            !producerHasStarted && energyProvided == 0 && energyReceived == 0,
            "Not allowed"
        );
        tokenContract.transfer(consumer, balanceSmartContract());
    }

    /**
     * @dev Finalizes the energy exchange and handles payments and refunds
     */
    function finalizeExchange() internal {
        require(
            !incidentActive,
            "Cannot finalize exchange with an active incident"
        );
        require(
            energyProvided > 0 && energyReceived > 0,
            "Energy exchange not started"
        );
        require(consumerHasPaid(), "Consumer has not paid the required amount");
        uint256 totalPaid = tokenContract.balanceOf(address(this));
        uint256 refund = 0;
        uint256 paymentAfterFee = (totalPaid * (100 - feePlatform)) / 100;
        uint256 payemntPlatform = (totalPaid * feePlatform) / 100;

        // Handling refunds if energy provided is less than agreed
        if (energyProvided < totalEnergy) {
            refund = ((totalEnergy - energyProvided) * priceKwH) / 10 ** 18;
            paymentAfterFee -= refund;
            tokenContract.transfer(consumer, refund);
        }

        // Transferring payment to producer after fee deduction
        tokenContract.transfer(producer, paymentAfterFee);
        tokenContract.transfer(address(tokenContract), payemntPlatform);
        emit ExchangeFinalized(
            consumer,
            producer,
            energyProvided,
            paymentAfterFee,
            refund
        );
    }

    /**
     * @dev Checks if the consumer has paid the required amount for the total energy
     * @return bool Whether the consumer has paid the required amount
     */
    function consumerHasPaid() public view returns (bool) {
        uint256 totalDue = (priceKwH * totalEnergy) / 10 ** 18;
        uint256 totalPaid = tokenContract.balanceOf(address(this));
        return totalPaid >= totalDue;
    }

    function balanceSmartContract() public view returns (uint256) {
        return tokenContract.balanceOf(address(this));
    }

    /**
     * @dev Helper function to calculate the absolute value of an integer
     * @param x Integer to calculate the absolute value for
     * @return uint256 The absolute value of the input
     */
    function abs(int256 x) private pure returns (uint256) {
        return x < 0 ? uint256(-x) : uint256(x);
    }

    /**
     * @dev Allows a consumer or producer to revoke a smart meter
     * @param smart_meter Address of the smart meter from which the user wants to revoke permission
     * @param typeUser 0 if it is a consumer, 1 if it is a producer
     */
    function revokeSmartMeter(address smart_meter, uint typeUser) public {
        if (typeUser == 0) {
            //Consumer
            require(msg.sender == consumer);
            smartMeterConsumer[smart_meter] = false;
        } else {
            require(msg.sender == producer);
            smartMeterProducer[smart_meter] = false;
        }
    }

    /**
     * @dev Allows a consumer or producer to add a smart meter
     * @param smart_meter Address of the smart meter from which the user wants to give permission
     * @param typeUser 0 if it is a consumer, 1 if it is a producer
     */
    function addSmartMeter(address smart_meter, uint typeUser) public {
        if (typeUser == 0) {
            //Consumer
            require(msg.sender == consumer);
            smartMeterConsumer[smart_meter] = true;
        } else {
            require(msg.sender == producer);
            smartMeterProducer[smart_meter] = true;
        }
    }
}
