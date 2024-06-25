import db from "../database/db.js";
import { DataTypes } from "sequelize";
import TNotificationModel from "./TNotificationModel.js";

const NotificationBroadcastModel = db.define('NOTIFICATION_BROADCAST', {
    idNotificationBroadcast: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date_creation: {
        type: DataTypes.DATE
    },
    content: {
        type: DataTypes.TEXT
    },
    idType: {
        type: DataTypes.INTEGER,
        references: {
            model: TNotificationModel,
            key: 'idType'
        }
    }

}, {
    tableName: 'NOTIFICATION_BROADCAST',
    timestamps: false
});
NotificationBroadcastModel.belongsTo(TNotificationModel, { foreignKey: 'idType' });

export default NotificationBroadcastModel;