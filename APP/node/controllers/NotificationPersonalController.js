import { Op } from "sequelize";
import NotoficationPersonalModel from "../models/NotoficationPersonModel.js";
import UserModel from "../models/UserModel.js";

/**
 * Inserts a new record into the NotificationPersonal table. These notifications can be added either by the system when it needs to 
 * notify a specific user about some information, or by a user who wants to send a message to a specific user.
 * @param {*} req is the request object that contains the content, the ID of the destination user, and the ID of the sender, or null if it's the system itself.
 * @param {*} res is the response object used to send back a response to the client.
 * @returns 
 */
export const InsertPersonalNotfication = async (req, res) => {
    try {
        const user = await UserModel.findOne({ where: { idUser: req.body.idReciver } });
        if (user.aceptPersonalNotification === 0) return res.status(403).json("Not Allowed");
        await NotoficationPersonalModel.create({
            date_creation: new Date(),
            content: req.body.content,
            is_read: 0,
            idSender: req.body.idSender, // Null if the sender is the system itself
            idReciver: req.body.idReciver,
            idType: req.body.idType
        });
        return res.status(200).json({ message: "Registro creado satisfactoriamente" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

/**
 * Mark a group of notification as read. This function is intended to update the status of a notification
 * in the NotificationPersonal table, setting its is_read filed to 1(true) to indicate that he notification
 * has been read by the user. Then the DBMS periodically will remove all the notification that have been read
 * @param {*} req The request object that contains the id of the notification to be marked as read
 * @param {*} res The response object used to send the result back to the client
 * @returns 
 */
export const markNotificationPersonalAsReaded = async (req, res) => {
    try {
        const { idNotifications, idUser } = req.body;
        if (!Array.isArray(idNotifications)) {
            return res.status(400).json({ message: "idNotifications should be an array" });
        }

        let results = await Promise.all(idNotifications.map(async (idNotification) => {
            try {
                const notification = await NotoficationPersonalModel.findByPk(idNotification);
                if (!notification) {
                    return;
                }
                if (notification.idReciver === idUser) {
                    notification.is_read = 1;
                    await notification.save();
                } else {
                    return;
                }
            } catch (error) {
                return { idNotification, status: 500, message: "Internal Server Error", details: error.message };
            }
        }));

        return res.status(200).json(results);

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

/**
 * Retrieves all active chat notifications for a given user. An active chat notification is defined as any notification
 * where the user is either the sender or the receiver and the notification has not yet been read (`is_read: 0`).
 * 
 * This function queries the `NotificationPersonalModel` for all such notifications, including the sender's information
 * (username and email) by joining with the `UserModel`. The result is then formatted to include essential information
 * about each notification and the sender's details.
 * 
 * @param {number|string} idUser - The unique identifier of the user for whom to retrieve active chat notifications.
 * This could be the user's ID in the database.
 * 
 * @returns {Promise<Array| null>} A promise that resolves to an array of objects, each representing an active chat
 * notification, including sender information. If no active chat notifications are found, the promise resolves to `null`.
 * 
 * Each object in the returned array includes the following properties:
 * - `idNotificationPersonal`: The unique identifier of the notification.
 * - `content`: The content of the chat message.
 * - `date_creation`: The timestamp when the notification was created.
 * - `idSender`: The identifier of the user who sent the notification.
 * - `nameSender`: The username of the sender (retrieved from the included `UserModel`).
 * - `emailSender`: The email address of the sender.
*/
export const getActiveChats = async (idUser) => {
    try {
        const notifications = await NotoficationPersonalModel.findAll({
            attributes: ['idNotification', 'content', 'date_creation', 'idSender', 'idReciver'],
            include: [{
                model: UserModel,
                attributes: ['userName', 'email'],
                as: 'Sender'
            }],
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { idReciver: idUser },
                            { idSender: idUser }
                        ],
                    },
                    { is_read: 0 }
                ]
            }

        });
        if (notifications) {
            const formattedResults = notifications.map((notification) => ({
                idNotificationPersonal: notification.idNotification,
                content: notification.content,
                date_creation: notification.date_creation,
                idSender: notification.idSender,
                nameSender: notification.Sender.userName,
                emailSender: notification.Sender.email
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
 * Retrieves unread personal notifications from the system for a specific user. 
 * Personal notifications from the system are identified by having a null `idSender`,
 * indicating that they are not sent from another user but rather generated by the system itself.
 * Only notifications that have not been read (`is_read: 0`) and are directed towards the specified user (`idReciver`)
 * are fetched.
 *
 * @param {number|string} idUser - The unique identifier of the user for whom to retrieve the system notifications.
 * This can be a numerical ID or a string, depending on how user IDs are defined in your database.
 *
 * @returns {Promise<Array|null>} A promise that resolves to an array of notification objects if any are found,
 * each containing the notification's ID (`idNotificationPersonal`), content (`content`), and creation date (`date_creation`).
 * If no such notifications are found, the promise resolves to `null`.
 *
 * Each notification object in the array includes the following properties:
 * - `idNotificationPersonal`: The unique identifier of the notification.
 * - `content`: The content/message of the notification.
 * - `date_creation`: The timestamp indicating when the notification was created.
 */
export const getPersonalNotificationsfromSystem = async (idUser) => {
    try {
        const notifications = await NotoficationPersonalModel.findAll({
            attributes: ['idNotification', 'content', 'date_creation', 'idSender', 'idReciver'],
            where: {
                [Op.and]: [
                    { idReciver: idUser },
                    { idSender: null },
                    { is_read: 0 }
                ]
            }
        });

        if (notifications) {
            const formattedResults = notifications.map((notification) => ({
                idNotificationPersonal: notification.idNotification,
                content: notification.content,
                date_creation: notification.date_creation,
            }));
            return formattedResults;
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}

export const getFullChatWithUser = async (myID, idUser) => {
    try {
        const notifications = await NotoficationPersonalModel.findAll({
            attributes: ['idNotification', 'content', 'date_creation', 'idSender', 'idReciver'],
            include: [{
                model: UserModel,
                attributes: ['userName', 'email'],
                as: 'Sender'
            }, {
                model: UserModel,
                attributes: ['userName', 'email'],
                as: 'Reciver'
            }],
            where: {
                [Op.or]: [
                    {
                        [Op.and]: [
                            { idSender: myID },
                            { idReciver: idUser }
                        ]
                    },
                    {
                        [Op.and]: [
                            { idSender: idUser },
                            { idReciver: myID }
                        ]
                    }
                ]
            },
            order: [['date_creation', 'ASC']]

        });
        if (notifications.length) {
            const formattedMessages = notifications.map((message) => ({
                idMessage: message.idMessage,
                content: message.content,
                date_creation: message.date_creation,
                idSender: message.idSender,
                nameSender: message.Sender.userName,
                emailSender: message.Sender.email,
                idReceiver: message.idReceiver,
                nameReceiver: message.Reciver.userName,
                emailReceiver: message.Reciver.email
            }));
            return formattedMessages;

        } else {
            return [];
        }
    } catch (error) {
        throw error;
    }
}