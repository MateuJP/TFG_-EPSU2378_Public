import db from "../database/db.js";
import { DataTypes } from "sequelize";
import UserModel from '../models/UserModel.js';

const AgreementModel = db.define('AGREEMENT', {
    contractAddress: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    price_kwh: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    },
    totalEnergy: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    },
    is_alive: {
        type: DataTypes.TINYINT
    },
    idConsumer: {
        type: DataTypes.INTEGER,
        references: {
            model: UserModel,
            key: 'idUser'
        }
    },
    idProducer: {
        type: DataTypes.INTEGER,
        references: {
            model: UserModel,
            key: 'idUser'
        }
    }

}, {
    tableName: "AGREEMENT",
    timestamps: false
});

AgreementModel.belongsTo(UserModel, { foreignKey: 'idConsumer', as: 'Consumer' });
AgreementModel.belongsTo(UserModel, { foreignKey: 'idProducer', as: 'Producer' });


export default AgreementModel;

