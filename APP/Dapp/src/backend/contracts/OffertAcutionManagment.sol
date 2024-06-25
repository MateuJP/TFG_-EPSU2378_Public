// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OfferAuctionManagement Contract
 * @dev Manages the offers for auction requests in the energy trading platform, ensuring secure transactions and ownership.
 */
contract OffertAcutionManagment is Ownable, ReentrancyGuard {
    /**
     * @dev Struct to represent a producer's offer in an auction
     */
    struct Offer {
        uint index;
        uint256 idOffer;
        address producer;
        uint64 price_kwh;
        uint32 energy_amount;
    }
    // Mapping to store offers for each auction request by request ID
    mapping(uint256 => Offer[]) public offerts_request_auctions;

    mapping(uint256 => uint) private idOffer_index;

    event NewOffer(
        address indexed producer,
        uint256 id_request,
        uint indexOffer
    );

    constructor() {}

    /**
     * @dev Allows producers to submit their offers for a specific auction request
     * @param producer Address of the producer making the offer
     * @param id_request ID of the auction request to which the offer is made
     * @param id_offer Id of the offer
     * @param price_kwh Price per kWh being offered
     * @param energy_amount Amount of energy being offered
     */
    function sendOffer(
        address producer,
        uint256 id_request,
        uint256 id_offer,
        uint64 price_kwh,
        uint32 energy_amount
    ) external onlyOwner nonReentrant {
        Offer memory offer = Offer({
            index: offerts_request_auctions[id_request].length,
            idOffer: id_offer,
            producer: producer,
            price_kwh: price_kwh,
            energy_amount: energy_amount
        });
        offerts_request_auctions[id_request].push(offer);
        idOffer_index[id_offer] = offer.index;
        emit NewOffer(producer, id_request, offer.idOffer);
    }

    /**
     * @dev Determines the winning offer for an auction request based on specified criteria.
        Only the ETradingAuction contract cant execute this function and only if the limit
        time of the auction has finished. The criteria for select a winner is as follows. 
        Offers that satisfy energy demands at the established price have priority.
        If there are several, the cheapest is selected. If none of them meet the energy demands, 
        priority is given to the one that offers the most energy.
     * @param id_request ID of the auction request
     * @param energy_amount Minimum energy amount required by the consumer
     * @param max_price_kwh Maximum price per kWh the consumer is willing to pay
     * @return id_offer_winner ID of the winning offer
     * @return price_agreed Price per kWh of the winning offer
     * @return energy_agreed Energy amount of the winning offer
     */
    function winnerAuction(
        uint256 id_request,
        uint32 energy_amount,
        uint64 max_price_kwh
    ) external onlyOwner nonReentrant returns (uint256, uint64, uint32) {
        Offer[] memory offerts = offerts_request_auctions[id_request];
        require(offerts.length > 0, "No offerts available");

        Offer memory bestMatchOffert;
        bool hasBestMatch = false;

        Offer memory maxEnergyOffert;
        bool hasMaxEnergy = false;

        for (uint i = 0; i < offerts.length; i++) {
            if (
                offerts[i].energy_amount >= energy_amount &&
                offerts[i].price_kwh <= max_price_kwh
            ) {
                if (
                    !hasBestMatch ||
                    offerts[i].price_kwh < bestMatchOffert.price_kwh
                ) {
                    bestMatchOffert = offerts[i];
                    hasBestMatch = true;
                }
            } else if (
                !hasMaxEnergy ||
                offerts[i].energy_amount > maxEnergyOffert.energy_amount ||
                (offerts[i].energy_amount == maxEnergyOffert.energy_amount &&
                    offerts[i].price_kwh < maxEnergyOffert.price_kwh)
            ) {
                maxEnergyOffert = offerts[i];
                hasMaxEnergy = true;
            }
        }
        if (hasBestMatch) {
            return (
                bestMatchOffert.idOffer,
                bestMatchOffert.price_kwh,
                bestMatchOffert.energy_amount
            );
        } else if (hasMaxEnergy) {
            return (
                maxEnergyOffert.idOffer,
                maxEnergyOffert.price_kwh,
                maxEnergyOffert.energy_amount
            );
        } else {
            revert("No suitable offert found");
        }
    }

    function deleteOffersAcution(uint256 id_request) external onlyOwner {
        delete offerts_request_auctions[id_request];
    }

    /**
     * @dev Retrieves the details of a specific offer
     * @param id_request ID of the auction request for which to find the offer
     * @param id_offer ID of the offer to retrieve
     * @return Address of the producer who made the offer
     * @return price_kwh Price per kWh of the offer
     * @return energy_amount Energy amount of the offer
     */
    function getOffer(
        uint256 id_request,
        uint256 id_offer
    ) external view onlyOwner returns (address, uint64, uint32) {
        uint index = idOffer_index[id_offer];
        return (
            offerts_request_auctions[id_request][index].producer,
            offerts_request_auctions[id_request][index].price_kwh,
            offerts_request_auctions[id_request][index].energy_amount
        );
    }
}
