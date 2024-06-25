import db from "../database/db.js";
import { DataTypes } from "sequelize";

const TNotificationModel = db.define('T_NOTIFICATION', {
    idType: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'T_NOTIFICATION',
    timestamps: false
});
export default TNotificationModel