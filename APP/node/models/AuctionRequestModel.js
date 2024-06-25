import db from "../database/db";
import UserModel from "./UserModel.js";
import { DataTypes } from "sequelize";

const AuctionRequestModel = db.define('AUCTION_REQUEST', {
    idRequest: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    max_price: {
        type: DataTypes.DECIMAL(10, 3)
    },
    energy_amount: {
        type: DataTypes.DECIMAL(10, 3)
    },
    limit_time: {
        type: DataTypes.TIMESTAMP
    },
    idConsumer: {
        type: DataTypes.INTEGER,
        references: {
            model: UserModel,
            key: 'idUser'
        }
    }
});
AuctionRequestModel.belongsTo(UserModel, { foreignKey: 'idConsumer' });
export default AuctionRequestModel;