import { Op } from "sequelize";
import MarketOfertModel from "../models/MarketOfertModel.js"

/**
 * This function inser a new record in the table MarketOffer. When a producer send an offer to the open market, the system will 
 * call this function and will create a new record in the table
 * @param {*} req- The request object that contains the price per kwh, the amount of energy and the id of the producer
 * @param {*} res - The response object used to send the result back to the client
 * @returns 
 */
export const InsertMarketOffer = async (req, res) => {
    try {
        await MarketOfertModel.create({
            idOfert: parseInt(req.body.idOfert),
            price_kwh: parseFloat(req.body.price_kwh),
            amount_energy: parseFloat(req.body.amount_energy),
            is_avaliable: req.body.is_avaliable,
            date_creation: new Date(),
            idProducer: req.body.idUser
        });
        return res.status(200).json({ message: "Record added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

/**
 * This function updates the amount of energy in a market offer. When a consumer selects an offer, if there is leftover
 * energy, this functions updates the amount of energy.
 * @param {*} req - The request object with the id of the offer and the new amount of energy
 * @param {*} res - The response object used to send the result back to the client
 * @returns 
 */
export const UpdateAmountMarketOffer = async (req, res) => {
    try {
        const marketOffer = await MarketOfertModel.findOne({ where: { idOfert: req.body.idOfert } });
        if (!marketOffer) return res.status(404).json({ message: "Offer not found" });
        marketOffer.amount_energy = req.body.amount_energy;
        await marketOffer.save();
        return res.status(200).json({ message: "Record updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
/**
 * This function updates the is_avaliable attribute in a market offer. When a consumer selects an offer, if there is leftover
 * energy, this functions updates the amount of energy.
 * @param {*} req - The request object with the id of the offer and the new amount of energy
 * @param {*} res - The response object used to send the result back to the client
 * @returns 
 */
export const UpdateAvaliableOffer = async (req, res) => {
    try {
        const marketOffer = await MarketOfertModel.findOne({ where: { idOfert: req.body.idOfert } });
        if (!marketOffer) return res.status(404).json({ message: "Offer not found" });
        marketOffer.is_avaliable = req.body.is_avaliable;
        await marketOffer.save();
        return res.status(200).json({ message: "Record updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

/**
* If the producer wishes to withdraw an existing offer from the market, he can call
* this function and destroy the record
 * @param {*} req - The request object that contains the id of the offer
 * @param {*} res - The response object used to send the result back to the client
 * @returns 
 */
export const deleteMarketOffer = async (req, res) => {
    try {
        console.log(req.body)

        const offer = await MarketOfertModel.findOne({ where: { idOfert: req.body.idOfert } })
        if (offer) {
            if (offer.idProducer !== req.body.idUser) return res.status(403).json("Not Allowed");

            await offer.destroy()
            return res.status(200).json({ message: "Record deleted successfully" });
        } else {
            return res.status(404).json("Not Found");
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
/**
* This function removes a market offer from the table. When a consumer buys all the energy from a supply, the system
* remove the record from the table. 
 * @param {*} req - The request object that contains the id of the offer
 * @param {*} res - The response object used to send the result back to the client
 * @returns 
 */
export const deleteMarketOfferSystem = async (req, res) => {
    try {
        const offer = await MarketOfertModel.findOne({ where: { idOfert: req.body.idOfert } })
        if (offer) {
            await offer.destroy()
            return res.status(200).json({ message: "Record deleted successfully" });
        } else {
            return res.status(404).json("Not Found");
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
/**
 * Retrieves all available market offers from the database. It filters the offers by the `is_available` 
 * flag to return only those offers that are currently available.
 * @param {Object} req - The request object provided by Express. Not used in this function but required by Express handler signature.
 * @param {Object} res - The response object provided by Express. Used to return the JSON response to the client.
 * 
*/
export const getMarketOffer = async (req, res) => {
    try {
        const market_offers = await MarketOfertModel.findAll({
            where: { is_avaliable: 1 }
        });
        if (market_offers) {
            const formattedResults = market_offers.map((offer) => ({
                idOffer: offer.idOfert,
                price_kwh: offer.price_kwh,
                amount_energy: offer.amount_energy,
                date_creation: offer.date_creation,
                idProducer: offer.idProducer
            }));
            return res.status(200).json(formattedResults);
        } else {
            return res.status(200).json([]);
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
/**
 * Retrieves all available offers made by a specific producer from the database. This function is intended to be used as a utility function
 * and not directly as an Express route handler.
 * 
 * @param {number|string} idUser - The unique identifier of the producer whose offers are being retrieved. This could be a numerical ID or a string.
 * @returns {Array| null} An array of formatted offer objects if any are found, or `null` if no offers are found.
 */
export const getOfferFromProducer = async (idUser) => {
    try {
        const producerOffers = await MarketOfertModel.findAll({
            where: {
                [Op.and]: [
                    { idProducer: idUser },
                    { is_avaliable: 1 }
                ]
            }
        });
        if (producerOffers) {
            const formattedResults = producerOffers.map((producerOffers) => ({
                idOffer: producerOffers.idOfert,
                price_kwh: producerOffers.price_kwh,
                amount_energy: producerOffers.amount_energy,
                date_creation: producerOffers.date_creation
            }));
            return formattedResults;
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Retrieves all not reveal offers made by a specific producer from the database. This function is intended to be used as a utility function
 * and not directly as an Express route handler.
 * 
 * @param {number|string} idUser - The unique identifier of the producer whose offers are being retrieved. This could be a numerical ID or a string.
 * @returns {Array| null} An array of formatted offer objects if any are found, or `null` if no offers are found.
 */
export const getNotRevealOffersFromProducer = async (idUser) => {
    try {
        const result = await MarketOfertModel.findAll({
            where: {
                [Op.and]: [
                    { idProducer: idUser },
                    { is_avaliable: 0 }
                ]
            }
        });
        if (result) {
            const formattedResults = result.map((offer) => ({
                idOffer: offer.idOfert,
                price_kwh: offer.price_kwh,
                amount_energy: offer.amount_energy,
                date_creation: offer.date_creation
            }));
            return formattedResults;
        } else {
            return null;
        }
    } catch (error) {
        throw error
    }
}