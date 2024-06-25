// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ModelAgreement.sol";
import "./AcutionManagment.sol";
import "./OffertAcutionManagment.sol";

contract ETradingAcution is AccessControlDefaultAdminRules, ReentrancyGuard {
    // Role constants for various participants in the system
    bytes32 internal constant CONSUMER_ROLE = keccak256("CONSUMER_ROLE");
    bytes32 internal constant PROSUMER_ROLE = keccak256("PROSUMER_ROLE");
    bytes32 internal constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 internal constant REFEREE_ROLE = keccak256("REFEREE_ROLE");

    // Minimum allowed price per kWh on the platform
    uint64 public min_kwh_price;

    // Token contract address
    address internal token_contract_address;

    uint256 nonce = 0;

    // Auction and offer management contract instances
    address public acution_managment_contract;
    AcutionManagment acution;
    address public offert_acution_contract;
    OffertAcutionManagment offerAcution;

    event NewAgreement(
        address indexed consumer,
        address indexed producer,
        address indexed agreement
    );

    constructor(
        uint48 _initialDelay,
        uint64 _min_kwh_price,
        address token_address
    ) AccessControlDefaultAdminRules(_initialDelay, msg.sender) {
        min_kwh_price = _min_kwh_price;
        token_contract_address = token_address;
        acution_managment_contract = address(new AcutionManagment());
        acution = AcutionManagment(acution_managment_contract);
        offert_acution_contract = address(new OffertAcutionManagment());
        offerAcution = OffertAcutionManagment(offert_acution_contract);
    }

    /**
     * @dev Allows a consumer to send an auction request
     * @param max_price_kwh Maximum price per kWh the consumer is willing to pay
     * @param id_request id of the request computed of chain
     * @param energy_amount Amount of energy requested
     * @param limitTime Time limit for the auction in minutes
     */

    function sendAcution(
        uint64 max_price_kwh,
        uint256 id_request,
        uint32 energy_amount,
        uint limitTime
    ) public nonReentrant {
        require(hasRole(CONSUMER_ROLE, msg.sender));
        require(limitTime >= 10 && limitTime <= 50);
        require(max_price_kwh > min_kwh_price);
        acution.sendRequest(
            msg.sender,
            id_request,
            max_price_kwh,
            energy_amount,
            limitTime
        );
    }

    /**
     * @dev Allows a producer or prosumer to send an offer to a specific auction request
     * @param id_request ID of the request to which the offer is being made
     * @param price_kwh Price per kWh being offered
     * @param energy_amount Amount of energy being offered
     */
    function sendOffert(
        uint256 id_request,
        uint256 idOffer,
        uint64 price_kwh,
        uint32 energy_amount
    ) public nonReentrant {
        require(
            hasRole(PRODUCER_ROLE, msg.sender) ||
                hasRole(PROSUMER_ROLE, msg.sender),
            "Not Allowed"
        );
        (address consumer, uint64 max_price_kwh, , uint32 limit_time) = acution
            .getRequest(id_request);
        require(block.timestamp < limit_time, "The acution is closed");
        require(consumer != address(0), "Not allowed");
        require(price_kwh <= max_price_kwh, "Price not allowed");
        offerAcution.sendOffer(
            msg.sender,
            id_request,
            idOffer,
            price_kwh,
            energy_amount
        );
    }

    /**
     * @dev Selects the winner of an auction based on the offers received
     * @param id_request ID of the request for which to select the winner
     * @return id_offer_winner ID of the winning offer
     * @return price_agreed Agreed upon price per kWh
     * @return energy_agreed Amount of energy agreed upon
     */
    function selectWinner(
        uint256 id_request
    )
        public
        returns (
            uint256 id_offer_winner,
            uint64 price_agreed,
            uint32 energy_agreed
        )
    {
        (
            address consumer,
            uint64 max_price_kwh,
            uint32 energy_amount,
            uint32 limit_time
        ) = acution.getRequest(id_request);
        require(block.timestamp >= limit_time, "The acution is not close");
        require(msg.sender == consumer, "Not Allowed");
        (
            uint256 id_offer,
            uint64 price_kwh,
            uint32 energy_provided
        ) = offerAcution.winnerAuction(
                id_request,
                energy_amount,
                max_price_kwh
            );
        return (id_offer, price_kwh, energy_provided);
    }

    /**
     * @dev Creates a new agreement based on the winning offer and request
     * @param id_request ID of the request involved in the agreement
     * @param id_offer ID of the winning offer
     * @param smartMeterConsumer Addresses of the consumer's smart meters
     * @param smartMeterProducer Addresses of the producer's smart meters
     */
    function createAgreement(
        uint256 id_request,
        uint256 id_offer,
        address[] memory smartMeterConsumer,
        address[] memory smartMeterProducer
    ) public nonReentrant {
        (address consumer, , , ) = acution.getRequest(id_request);
        require(msg.sender == consumer);
        (
            address producer,
            uint256 price_agreed,
            uint256 energy_agreed
        ) = offerAcution.getOffer(id_request, id_offer);
        address agreement_address = address(
            new Agreement(
                token_contract_address,
                msg.sender,
                producer,
                price_agreed,
                energy_agreed,
                smartMeterConsumer,
                smartMeterProducer
            )
        );

        offerAcution.deleteOffersAcution(id_request);
        acution.deleteRequest(1, id_request, msg.sender);
        emit NewAgreement(msg.sender, producer, agreement_address);
    }

    /**
     * @dev Delete a request before the acution is closed
     * @param id_request ID of the request
     */
    function deleteRequest(uint256 id_request) public {
        require(hasRole(CONSUMER_ROLE, msg.sender));
        acution.deleteRequest(0, id_request, msg.sender);
    }
}
