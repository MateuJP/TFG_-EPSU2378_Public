import db from "../database/db.js";
import { DataTypes } from "sequelize";

const RoleModel = db.define('ROLE', {
    idRole: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'ROLE',
    timestamps: false
});
export default RoleModel