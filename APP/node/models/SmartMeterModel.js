import db from "../database/db.js";
import UserModel from "./UserModel.js";
import { DataTypes } from "sequelize";

const SmartMetetModel = db.define('SMART_METER', {
    idSmartMeter: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    },
    wallet: {
        type: DataTypes.STRING
    },
    idOwner: {
        type: DataTypes.INTEGER,
        references: {
            model: UserModel,
            key: 'idUser'
        }
    }
}, {
    tableName: 'SMART_METER',
    timestamps: false
});
SmartMetetModel.belongsTo(UserModel, { foreignKey: 'idOwner' })
export default SmartMetetModel;