import db from "../database/db.js";
import TNotificationModel from './TNotificationModel.js'
import UserModel from './UserModel.js'
import { DataTypes, Sequelize } from "sequelize";

const NotoficationPersonalModel = db.define('NOTIFICATION_PERSONAL', {
    idNotification: {
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
    is_read: {
        type: DataTypes.TINYINT
    },
    idSender: {
        type: DataTypes.INTEGER,
        allowNull: true,// If is the system , the reciver is null
        references: {
            model: UserModel,
            key: 'idUser'
        }
    },
    idReciver: {
        type: DataTypes.INTEGER,
        references: {
            model: UserModel,
            key: 'idUser'
        }
    },
    idType: {
        type: DataTypes.INTEGER,
        references: {
            model: TNotificationModel,
            key: 'idType'
        }
    }
}, {
    tableName: 'NOTIFICATION_PERSONAL',
    timestamps: false
});
NotoficationPersonalModel.belongsTo(UserModel, { foreignKey: 'idSender', as: 'Sender' })
NotoficationPersonalModel.belongsTo(UserModel, { foreignKey: 'idReciver', as: 'Reciver' })

NotoficationPersonalModel.belongsTo(TNotificationModel, { foreignKey: 'idType' })

export default NotoficationPersonalModel;