import db from "../database/db.js";
import { DataTypes } from "sequelize";
import RoleModel from './RoleModel.js';
const UserModel = db.define('USER', {
    idUser: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userName: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    wallet: {
        type: DataTypes.STRING
    },
    idRole: {
        type: DataTypes.INTEGER,
        references: {
            model: RoleModel,
            key: 'idRole'
        }
    },
    is_admin: {
        type: DataTypes.INTEGER
    },
    publicProfile: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    aceptPersonalNotification: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    twitterAccount: {
        type: DataTypes.STRING
    },
    instagramAccount: {
        type: DataTypes.STRING
    },
    facebookAccount: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'USER',
    timestamps: false
});

UserModel.belongsTo(RoleModel, { foreignKey: 'idRole' })

export default UserModel;