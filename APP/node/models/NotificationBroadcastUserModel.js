import db from "../database/db.js";
import { DataTypes } from "sequelize";
import NotificationBroadcastModel from "./NotificationBroadcastModel.js";
import UserModel from "./UserModel.js";

const NotificationBroadcastUserModel = db.define('NOTIFICATION_BROADCAST_USER', {
    idNotificationBroadcast: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: NotificationBroadcastModel,
            key: 'idNotificationBroadcast'
        }
    },
    idUser: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: UserModel,
            key: 'idUser'
        }
    },
    is_read: {
        type: DataTypes.TINYINT
    }
}, {
    tableName: 'NOTIFICATION_BROADCAST_USER',
    timestamps: false
});

NotificationBroadcastUserModel.belongsTo(NotificationBroadcastModel, { foreignKey: 'idNotificationBroadcast' });
NotificationBroadcastUserModel.belongsTo(UserModel, { foreignKey: 'idUser' });

export default NotificationBroadcastUserModel;
