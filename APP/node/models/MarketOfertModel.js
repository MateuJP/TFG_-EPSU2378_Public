import db from "../database/db.js";
import { DataTypes } from "sequelize";
import UserModel from '../models/UserModel.js'

const MarketOfertModel = db.define('MARKET_OFERTS', {
    idOfert: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    price_kwh: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    },
    amount_energy: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    },
    is_avaliable: {
        type: DataTypes.TINYINT
    },
    date_creation: {
        type: DataTypes.DATE
    },
    idProducer: {
        type: DataTypes.INTEGER,
        references: {
            model: UserModel,
            key: 'idUser'
        }
    }
}, {
    tableName: 'MARKET_OFERTS',
    timestamps: false
});
MarketOfertModel.belongsTo(UserModel, { foreignKey: 'idProducer' });

export default MarketOfertModel;
