import SmartMeterModel from '../models/SmartMeterModel.js'

/**
 * Function called by a registered user when they want to add a new smart meter
 * @param{*} req - The request object with the information of the smart meter
 * @param{*} res - The response object
 * @returns status 200 if the smart meter was added succesfully 500 if not
 */
export const addSmartMeter = async (req, res) => {
    try {
        const { name, wallet, idUser } = req.body;
        await SmartMeterModel.create({
            name: name,
            wallet: wallet,
            idOwner: idUser
        })
        return res.status(200).json({ message: "Smart Meter añadido satisfactoriamente" })
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });

    }
}

/**
 * Function called by a registered user when they want to remove a smart meter from their collection
 * @param {*} req - The request object with the id of the smart meter
 * @param {*} res - The response object
 * @returns 
 */
export const removeSmartMeter = async (req, res) => {
    try {
        const { idSmartMeter, idUser } = req.body;
        await SmartMeterModel.destroy({
            where: { idSmartMeter: idSmartMeter, idOwner: idUser }
        })
        return res.status(200).json({ message: "Smart Meter eliminado satisfactoriamente" })

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
/**
 * Function that returns all the smart meters of the user identified by idOwner
 * @param {*} req - The request objecti with the id of the owner
 * @param {*} res - The response object
 * @returns 
 */
export const getSmartMetersFromUser = async (idUser) => {
    try {
        const resp = await SmartMeterModel.findAll({
            where: { idOwner: idUser }
        })
        if (resp) {
            const formattedResults = resp.map((result) => ({
                idSmartMeter: result.idSmartMeter,
                name: result.name,
                wallet: result.wallet

            }));
            return formattedResults;

        } else {
            return [];
        }
    } catch (error) {
        throw error
    }
}
/**
 * Function that returns the smart meters address of a user
 * @param {*} req - The request objecti with the id of the owner
 * @param {*} res - The response object
 * @returns 
 */
export const getAddressSmartMeter = async (idUser) => {
    try {
        const resp = await SmartMeterModel.findAll({
            where: { idOwner: idUser }
        })
        if (resp) {
            const formattedResults = resp.map((result) => ({
                address: result.wallet

            }));
            return formattedResults;

        } else {
            return [];
        }
    } catch (error) {
        throw error
    }
}
/**
 * Function that update the smart meter of the user
 * @param {*} req - The request object with the information of the smart meter
 * @param {*} res - The response object
 * @returns 
 */
export const updateSmartMeter = async (req, res) => {
    try {
        const smart_meter = await SmartMeterModel.findByPk(req.body.idSmartMeter);
        console.log(req.body)
        if (!smart_meter) return res.status(400).json({ message: "Lector no encontrado" });
        if (smart_meter.idOwner != req.body.idUser) return res.status(401).json({ message: "Acción no permitida" })
        if (req.body.name !== null && req.body.name !== undefined && req.body.name !== '') {
            smart_meter.name = req.body.name;
        }

        if (req.body.wallet !== null && req.body.wallet !== undefined && req.body.wallet != '') {
            smart_meter.wallet = req.body.wallet;
        }

        await smart_meter.save();
        return res.status(200).json({ message: 'Smart Meter actualizado' });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });

    }
}