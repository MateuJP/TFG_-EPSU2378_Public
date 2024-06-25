// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ModelAgreement.sol";

contract ETradingMarket is AccessControlDefaultAdminRules, ReentrancyGuard {
    // Role constants for various participants in the system
    bytes32 internal constant CONSUMER_ROLE = keccak256("CONSUMER_ROLE");
    bytes32 internal constant PROSUMER_ROLE = keccak256("PROSUMER_ROLE");
    bytes32 internal constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 internal constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Struct for producer offers
    struct Offer {
        uint index;
        uint256 id_offer;
        address producer;
        uint64 price_kwh;
        uint256 energy_amount;
        bool is_available;
    }

    //Mapping that relates an offer to its hash
    mapping(uint256 => bytes32) private offert_proposal;

    // Array of available offers on the market
    Offer[] public market_offers;
    // Mapping for traking the index of the idOffer
    mapping(uint256 => uint) public idOffer_index;

    // Minimum allowed price per kWh on the platform
    uint64 public min_kwh_price;

    // Token contract address
    address internal token_contract_address;

    uint256 internal nonce = 0;
    uint256 public immutable close_time = 22;
    uint256 public immutable open_time = 8;
    bool private allowDeleted = false;

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
    }

    /**
     * @dev Allows producers to send energy offers. Offers are hashed and stored initially.
     * @param price_kwh Price per kWh of the energy offer
     * @param id_offer Id of the offer computed of chain
     * @param energy_amount Amount of energy offered
     */
    function submitOffer(
        uint64 price_kwh,
        uint256 id_offer,
        uint256 energy_amount
    ) public {
        //require(!isMarketOpen());
        require(hasRole(PRODUCER_ROLE, msg.sender));
        require(price_kwh >= min_kwh_price);
        require(offert_proposal[id_offer] == bytes32(0));
        offert_proposal[id_offer] = keccak256(
            abi.encodePacked(id_offer, price_kwh, energy_amount, msg.sender)
        );
    }

    /**
     * @dev Opens the submitted offers for the market after verification.
     * @param id_offer The unique ID of the offer to open
     * @param price_kwh Price per kWh of the energy offer
     * @param energy_amount Amount of energy offered
     */
    function revealOffer(
        uint256 id_offer,
        uint64 price_kwh,
        uint256 energy_amount
    ) public {
        //require(isMarketOpen());
        require(hasRole(PRODUCER_ROLE, msg.sender));
        require(
            offert_proposal[id_offer] ==
                keccak256(
                    abi.encodePacked(
                        id_offer,
                        price_kwh,
                        energy_amount,
                        msg.sender
                    )
                ),
            "Offer details do not match"
        );
        market_offers.push(
            Offer(
                market_offers.length,
                id_offer,
                msg.sender,
                price_kwh,
                energy_amount,
                true
            )
        );
        idOffer_index[id_offer] = market_offers.length - 1;
    }

    /**
     * @dev Allows a producer to delete the offer submited by him
     * @param id_offer The unique ID of the offer to open
     */
    function deleteOffer(uint256 id_offer) public {
        uint index = idOffer_index[id_offer];
        require(msg.sender == market_offers[index].producer || allowDeleted);
        require(market_offers[index].is_available);
        market_offers[index] = market_offers[market_offers.length - 1];
        market_offers[index].index = index;
        idOffer_index[market_offers[index].id_offer] = index;
        market_offers.pop();
    }

    /**
     * @dev Creates a new agreement based on a selected offer.
     * @param id_offer The ID of the selected offer
     * @param smartMeterConsumer Addresses of consumer's smart meters
     * @param smartMeterProducer Addresses of producer's smart meters
     */
    function createAgreement(
        uint256 id_offer,
        uint256 amount,
        address[] memory smartMeterConsumer,
        address[] memory smartMeterProducer
    ) public {
        require(hasRole(CONSUMER_ROLE, msg.sender));
        Offer memory offer = market_offers[idOffer_index[id_offer]];
        require(offer.energy_amount >= amount);
        address agreement_address = address(
            new Agreement(
                token_contract_address,
                msg.sender,
                offer.producer,
                offer.price_kwh,
                amount,
                smartMeterConsumer,
                smartMeterProducer
            )
        );

        if (amount < offer.energy_amount) {
            offer.energy_amount -= amount;
            market_offers[idOffer_index[id_offer]] = offer;
        } else {
            allowDeleted = true;
            deleteOffer(id_offer);
            allowDeleted = false;
        }
        emit NewAgreement(msg.sender, offer.producer, agreement_address);
    }

    function getOffer(uint256 id_offer) external view returns (Offer memory) {
        return market_offers[idOffer_index[id_offer]];
    }

    function isMarketOpen() internal view returns (bool) {
        uint256 hourOfDay = (block.timestamp % 1 days) / 1 hours;
        return hourOfDay >= open_time && hourOfDay < close_time;
    }
}
