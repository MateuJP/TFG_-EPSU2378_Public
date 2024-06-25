import { Op } from "sequelize";
import AgreementModel from "../models/AgreementModel.js";
import UserModel from "../models/UserModel.js";

/**
 * Creates a new agreement record in the database. This function is called to store details of an agreement
 * between a consumer and a producer, including contract address, price per kWh, total energy involved,
 * and identifiers for both consumer and producer.
 * 
 * @param {*} req - The request object containing the necessary data for creating a new agreement, 
 * including contractAddress, price_kwh, totalEnergy, idConsumer, and idProducer.
 * @param {*} res - The response object used to send back a success message if the record is added successfully
 * or an error message if the operation fails.
 * @returns - This function does not return a value but sends a JSON response to the client.
 */
export const createAgreement = async (req, res) => {
    try {
        await AgreementModel.create({
            contractAddress: req.body.contractAddress,
            price_kwh: req.body.price_kwh,
            totalEnergy: req.body.totalEnergy,
            is_alive: 1,
            idConsumer: req.body.idConsumer,
            idProducer: req.body.idProducer
        });
        return res.status(200).json({ message: "Record Added Successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
/**
 * Retrieves all active agreements for a given user, either as a consumer or as a producer. 
 * An active agreement is defined by the 'is_alive' flag set to 1. The user ID is expected 
 * to be provided in the request body.
 * 
 * @param {*} idUser - The id of the user
 */
export const getAllUserAgreements = async (idUser) => {
    try {
        const agreements = await AgreementModel.findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { idConsumer: idUser },
                            { idProducer: idUser }
                        ]
                    },
                    { is_alive: 1 }
                ]
            }
        });
        if (agreements) {
            const formattedResults = agreements.map((agreement) => ({
                contractAddress: agreement.contractAddress,
                price_kwh: agreement.price_kwh,
                totalEnergy: agreement.totalEnergy,
                is_alive: agreement.is_alive
            }));
            return formattedResults
        } else {
            return null
        }
    } catch (error) {
        throw error
    }
}


/**
 * Retrieves information about agreements for a given use(either as a consumer or as a producer) and the contractAddress. 
 * Only returns a result if the idUser is the id of the consumer or the producer, if not the user is not allowed to view
 * the information about the contract
 * @param {*} idUser - The id of the user
 * @param {*} contractAddress - The address of the contract
 */
export const getAgreementFromContract = async (idUser, contractAddress) => {
    try {
        const agreement = await AgreementModel.findOne({
            where: { contractAddress: contractAddress },
            include: [
                {
                    model: UserModel,
                    as: 'Consumer',
                    attributes: ['userName']
                },
                {
                    model: UserModel,
                    as: 'Producer',
                    attributes: ['userName']
                }
            ]
        });
        if (agreement) {
            console.log(agreement);
            if (agreement.idProducer == idUser || agreement.idConsumer == idUser) {
                const formattedResult = {
                    contractAddress: agreement.contractAddress,
                    price_kwh: agreement.price_kwh,
                    totalEnergy: agreement.totalEnergy,
                    producerName: agreement.Producer.userName,
                    consumerName: agreement.Consumer.userName,
                    idConsumer: agreement.idConsumer,
                    idProducer: agreement.idProducer
                }
                return formattedResult
            } else {
                return null;
            }

        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}


/**
 * Marks an existing agreement as finished (no longer alive) in the database. This function is called when an agreement
 * needs to be terminated or completed. It sets the 'is_alive' flag of the agreement to 0 (indicating it's no longer active).
 * 
 * @param {*} req - The request object containing the contractAddress to identify the agreement to be finished.
 * @param {*} res - The response object used to send back a success message if the agreement is updated successfully
 * or an error message if the operation fails or the agreement is not found.
 * @returns - This function does not return a value but sends a JSON response to the client.
 */
export const finishAgreement = async (req, res) => {
    try {
        const agreement = await AgreementModel.findOne({
            where: { contractAddress: req.body.contractAddress }
        });
        if (!agreement) return res.status(404).json({ message: "Agreement Not Found" });
        agreement.is_alive = 0;
        await agreement.save();
        return res.status(200).json({ message: "Record updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
