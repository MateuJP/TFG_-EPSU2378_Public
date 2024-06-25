import { Op } from "sequelize";
import NotificationBroadcastUserModel from "../models/NotificationBroadcastUserModel.js";
import NotificationBroadcastModel from "../models/NotificationBroadcastModel.js";
import UserModel from "../models/UserModel.js";

/**
 * This function recive the list of all users reciving the notification, and create a record for each of them
 * @param {*} req The request object, that contains the id of the notification and the list of all users reciving the notification
 * @param {*} res The response object used to sen back a response to the client
 * @returns 
 */
export const insertUserToBroadcastNotification = async (req, res) => {
    try {
        const { idNotificationBroadcast, usersList } = req.body;
        // Iterate over the list of users and create a notification for each onec
        console.log(usersList);
        const notificationPromises = usersList.map(idUser => {
            return NotificationBroadcastUserModel.create({
                idNotificationBroadcast: idNotificationBroadcast,
                idUser: idUser,
                is_read: 0
            })
        })
        // Wait until all users have been added to the table
        await Promise.all(notificationPromises);
        return res.status(200).json({ message: "Operation completed successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
/**
 * Marks a specified broadcast notification as read for a given user. This function updates the is_read field of a broadcast 
 * notification to indicate that the notification has been read by the user. It requires te id of the broadcast notification
 * and the id of the user form the request body. Then de DBMS will remove all the record where the id_read is 1 and when
 * all the users have read the notification will remove the notification of the table notification broadcast
 * @param {*} req The request object that contains the id of the notification and the id of the user
 * @param {*} res The response object used to send back the operation result to the user
 * @returns 
 */
export const markNotificationBroadcastAsReaded = async (req, res) => {
    try {
        const { idNotifications, idUser } = req.body;

        if (!Array.isArray(idNotifications)) {
            return res.status(400).json({ message: "notifications should be an array" });
        }

        const results = await Promise.all(idNotifications.map(async (idNotificationBroadcast) => {
            try {
                const notification = await NotificationBroadcastUserModel.findOne({
                    where: { idNotificationBroadcast, idUser }
                });

                if (!notification) {
                    return;
                }

                if (notification.idUser === idUser) {
                    notification.is_read = 1;
                    await notification.save();
                } else {
                    return;
                }
            } catch (error) {
                return { idNotificationBroadcast, status: 500, message: "Internal Server Error", details: error.message };
            }
        }));

        return res.status(200).json(results);

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

/**
 * Retrieves all unread broadcast notifications for a specific user. This function queries the NotificationBroadcastUserModel
 * to find all notifications where the 'is_read' attribute is set to 0 (indicating they haven't been read yet) for the given user ID.
 * It includes content from the related NotificationBroadcastModel to provide comprehensive notification details.
 * 
 * @param {number} idUser - The unique identifier of the user for whom to retrieve broadcast notifications. This ID is used to filter
 *                          the notifications specific to the user and to ensure that only unread notifications are fetched.
 * @returns {Promise<Array|Null>} - A promise that resolves to an array of notification objects, each containing the notification broadcast ID,
 *                                  user ID, and the content of the notification. If no unread notifications are found for the user, it returns null.
 *                                  Each object in the array represents an individual notification with its respective content.
 */
export const getBroadcastnotifications = async (idUser) => {
    try {
        const notifications = await NotificationBroadcastUserModel.findAll({
            attributes: ['idNotificationBroadcast', 'idUser'],
            where: {
                [Op.and]: [
                    { idUser: idUser },
                    { is_read: 0 }

                ]
            },
            include: {
                model: NotificationBroadcastModel,
                attributes: ['content']
            }
        });
        if (notifications.length) {
            const formattedResults = notifications.map((notification) => ({
                idNotificationBroadcast: notification.idNotificationBroadcast,
                idUser: notification.idUser,
                content: notification.NOTIFICATION_BROADCAST.content
            }))
            return formattedResults;
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}