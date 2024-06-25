import RoleModel from '../models/RoleModel.js'

/**
 * Insert a new register in the Role table only the Admin can execute this function
 * @param {object} req - The request object with the data of the new role
 * @param {object} res - The response object
 */
export const insertRole = async (req, res) => {
    try {
        await RoleModel.create(req.body);
        return res.status(200).json({ message: "Registro creado satisfactoriamente" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
/**
 * Delete a role form the table Role, only the Admin can execute this function
 * @param {*} req - The request object with idRole in the parameters
 * @param {*} res - The response object
 * @returns 
 */

export const deleteRole = async (req, res) => {
    try {
        await RoleModel.destroy({
            where: { idRole: req.params.idRole }
        })
        return res.status(200).json({ message: "Registro eliminado satisfactoriamente" });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
/**
 * Return all the roles of the table Role. This is a public function
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const getRoles = async (req, res) => {
    try {
        const resp = await RoleModel.findAll();
        return res.status(200).json(resp);

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });

    }
}