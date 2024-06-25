import db from "../database/db.js";
import SmartMeterModel from "./SmartMeterModel.js";
import UserModel from './UserModel.js'
import { DataTypes } from "sequelize";

const EnergyProducedModel = db.define('ENERGY_PRODUCED', {
    idEProduced: {
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
    kwh_produced: {
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
    tableName: 'ENERGY_PRODUCED',
    timestamps: false
});
EnergyProducedModel.belongsTo(UserModel, { foreignKey: 'idUser' })
EnergyProducedModel.belongsTo(SmartMeterModel, { foreignKey: 'idSmartMeter' })

export default EnergyProducedModel;