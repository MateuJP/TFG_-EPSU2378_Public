import db from "../database/db.js";
import SmartMeterModel from "./SmartMeterModel.js";
import UserModel from './UserModel.js'
import { DataTypes } from "sequelize";

const EnergyConsumedModel = db.define('ENERGY_CONSUMED', {
    idEconsumed: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date_intro: {
        type: DataTypes.DATE
    },
    tstamp: {
        type: DataTypes.DATE
    },
    kwh_consumed: {
        type: DataTypes.DECIMAL(10, 3)
    },
    idUser: {
        type: DataTypes.INTEGER,
        references: {
            model: UserModel,
            key: 'idUser'
        }
    },
    idSmartMeter: {
        type: DataTypes.INTEGER,
        references: {
            model: SmartMeterModel,
            key: 'idSmartMeter'
        }
    }
}, {
    tableName: 'ENERGY_CONSUMED',
    timestamps: false
});
EnergyConsumedModel.belongsTo(UserModel, { foreignKey: 'idUser' })
EnergyConsumedModel.belongsTo(SmartMeterModel, { foreignKey: 'idSmartMeter' })

export default EnergyConsumedModel;