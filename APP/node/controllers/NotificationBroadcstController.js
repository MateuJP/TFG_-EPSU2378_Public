import NotificationBroadcastModel from "../models/NotificationBroadcastModel.js";

/**
 * Inserts a new record into the notification broadcast table. This function will be called by the system when it needs to send a
 * broadcast message to all users or specific group of users. The message content and type are provided in the req body
 * message to 
 * @param {*} req The request object, containing the necessary information to create a new broadcast notification
 * @param {*} res The response object used to send back the response to the client.This includes the status of the operation
 * and any messages or IDs generated as a result of the operation.
 * @returns 
 */
export const insertBroadcatNotification = async (req, res) => {
    try {
        const newBroadcast = await NotificationBroadcastModel.create({
            date_creation: new Date(),
            content: req.body.content,
            idType: req.body.idType
        });
        return res.status(200).json({ idNotificationBroadcast: newBroadcast.idNotificationBroadcast });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}