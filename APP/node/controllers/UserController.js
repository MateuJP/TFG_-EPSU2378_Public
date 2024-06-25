import UserModel from "../models/UserModel.js";
import bcrypt from 'bcrypt'
import { validationResult } from 'express-validator'
import RoleModel from "../models/RoleModel.js";
/**
 * Insert a new user in the database. This is a public function and by default the user is not admin
 * @param {*} req - The req object 
 * @param {*} res - The res object
 * @returns 
 */
export const createUser = async (req, res) => {
    try {
        // Validate request parameters using express-validator, this is for security reasons.
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { userName, email, password, wallet, idRole } = req.body
        const hashPassword = await bcrypt.hash(password, 10);
        await UserModel.create({
            userName: userName,
            email: email,
            password: hashPassword,
            wallet: wallet,
            idRole: idRole,
            is_admin: 0
        });
        return res.status(200).json({ messaje: "Usuario creado satisfactoriamente" })

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });

    }
}

export const deleteUserFromWallet = async (wallet) => {
    try {
        const user = await UserModel.findOne({ where: { wallet: wallet } });
        if (!user) return null;
        await user.destroy();
        return true;
    } catch (error) {
        throw error;
    }
}

/**
 * Handles updating an existing user's information in the database.
 * This endpoint requires the user to be authenticated and to be the owner of the profile they are attempting to update.
 * The function expects to receive in the request body (`req.body`) the fields that are to be updated,
 * such as email, wallet, idRole, and social media accounts (twitterAccount, instagramAccount, facebookAccount).
 * If the specified user is found, their information is updated with the provided values and saved to the database.
 * 
 * @param {Object} req - The request object containing a JSON body with the user details to be updated, including email, wallet, idRole, and social media accounts.
 * @param {Object} res - The response object used to return the outcome of the update operation.
 * @returns {Response} The function returns a 200 status code with a success message if the user's information is updated successfully.
 * If the user is not found, it returns a 404 status code with a "Record not found" message.
 * In case of any server errors, it returns a 500 status code with an "Internal Server Error" message and error details.
 */

export const updateUser = async (req, res) => {
    try {
        const user = await UserModel.findOne({ where: { idUser: req.body.idUser } });
        if (user) {
            user.email = req.body.email;
            user.wallet = req.body.wallet;
            user.idRole = req.body.idRole;
            user.twitterAccount = req.body.twitterAccount;
            user.instagramAccount = req.body.instagramAccount;
            user.facebookAccount = req.body.facebookAccount;
            await user.save();
            return res.status(200).json('Record Updated Successfully')

        } else {
            return res.status(404).json({ message: "Record not found" });

        }

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });

    }
}

/**
 * Handles updating an existing user's permision information in the database.
 * This endpoint requires the user to be authenticated and to be the owner of the profile they are attempting to update.
 * The function expects to receive in the request body (`req.body`) the fields that are to be updated,
 * @param {Object} req - The request object containing a JSON body with the user details to be updated, including email, wallet, idRole, and social media accounts.
 * @param {Object} res - The response object used to return the outcome of the update operation.
 * @returns {Response} The function returns a 200 status code with a success message if the user's information is updated successfully.
 * If the user is not found, it returns a 404 status code with a "Record not found" message.
 * In case of any server errors, it returns a 500 status code with an "Internal Server Error" message and error details.
 */
export const updatePermisions = async (req, res) => {
    try {
        const user = await UserModel.findOne({ where: { idUser: req.body.idUser } });
        if (user) {
            console.log("BODY", req.body)
            user.publicProfile = req.body.publicProfile;
            user.aceptPersonalNotification = req.body.aceptPersonalNotification;
            await user.save();
            return res.status(200).json('Record Updated Successfully')

        } else {
            return res.status(404).json({ message: "Record not found" });

        }

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });

    }
}


/**
 * Retrieves a user based on the provided email and password.
 *
 * @param {string} email - The email address of the user.
 * @param {string} password - The password of the user.
 * @returns {Object | null} - Returns user data if authentication succeeds, or null if the user is not found or password does not match.
 */
export const getUser = async (email, password) => {
    try {
        const user = await UserModel.findOne({
            where: { email: email },
        });
        if (!user) {
            return null;
        }
        // Compare the provided password with the hashed password sotred in the database
        const match = await bcrypt.compare(password, user.password)
        if (match) {
            return user.dataValues;
        } else {
            return null;
        }
    } catch (error) {
        throw new Error("Internal Server Error")
    }
}

export const returnUserAndRole = async (idUser) => {
    try {
        const user = await UserModel.findOne({
            attributes: ['idUser', 'userName', 'email', 'wallet', 'publicProfile', 'aceptPersonalNotification', 'twitterAccount', 'instagramAccount', 'facebookAccount'],
            include: {
                model: RoleModel,
                required: true,
                attributes: ['idRole', 'name']
            }, where: { idUser: idUser }
        });

        if (user) {
            return user;
        } else {
            return null
        }
    } catch (error) {
        return null
    }
}
/**
 * Retrieves all users with the role of 'producer' from the database.
 * This function performs a query to find all users who are assigned the 'producer' role,
 * based on the association between the UserModel and the RoleModel. The query filters users
 * by their role and includes only their 'idUser' attribute in the results.
 *
 * The function returns a JSON response with the status code 200 and the list of producers if any are found.
 * If no producers are found, it returns a JSON response with the status code 404 and a message indicating
 * that no producers were found. In case of an error during the query execution, it catches the exception
 * and returns a JSON response with the status code 500 and the error details.
 *
 * @param {Object} req - The request object from the client.
 * @param {Object} res - The response object to send back the HTTP response.
 * @returns {Promise} - A promise that resolves to the HTTP response with the producers or an error message.
 */
export const getProducers = async (req, res) => {
    try {
        const producers = await UserModel.findAll({
            attributes: ['idUser'],
            include: {
                model: RoleModel,
                where: { name: 'Producer' }
            }
        });

        if (producers && producers.length > 0) {
            return res.status(200).json(producers);
        } else {
            return res.status(404).json({ message: "No producers found" });
        }

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

export const getIdFromWallet = async (wallet) => {
    try {
        const user = await UserModel.findOne({
            attributes: ['idUser'],
            where: { wallet: wallet }
        });
        if (user) {
            return user;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}
/**
 * Handles the password change process for a user. First, it looks up the user by their ID provided in the request body.
 * If the user is found, it compares the provided current password with the stored hash using bcrypt. If the passwords match,
 * it proceeds to hash the new password and update the user's password in the database.
 * 
 * @param {*} req - The request object containing the user ID, current password, and new password.
 * @param {*} res - The response object used to send back the HTTP response.
 * @returns A JSON response indicating the outcome of the operation. It returns a success message with a 200 status code
 * if the password was changed successfully, a 403 status code if the current password does not match, a 404 status code
 * if the user was not found, and a 500 status code with error details in case of an internal server error.
 */
export const changePassword = async (req, res) => {
    try {
        const user = await UserModel.findOne({ where: { idUser: req.body.idUser } });
        if (user) {
            const match = await bcrypt.compare(req.body.password, user.password)

            if (match) {
                const newHash = await bcrypt.hash(req.body.newPassword, 10);
                user.password = newHash;
                await user.save();
                return res.status(200).json({ message: "Password Changed Successfully" })
            } else {
                return res.status(403).json({ message: "Not Allowed" });
            }
        } else {
            return res.status(404).json({ message: "Not Found" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

/**
 * Retrieves and returns a user's profile data if the user's profile is set to public.
 * The function queries the database for a user by their ID, selecting specific attributes 
 * from the UserModel such as userName, email, wallet, and various account details. It also
 * includes related role data from the RoleModel. If the user's `publicProfile` attribute is 
 * set to 0 (indicating a private profile), the function returns `null`, effectively hiding 
 * the user's profile data. If the profile is public, it returns the user's data.
 * 
 * @param {number} idUser - The ID of the user whose profile is to be viewed.
 * @returns {Object|null} The user's profile data if the profile is public, otherwise `null`.
 * @throws {Error} Throws an error if there's an issue accessing the database or finding the user.
 */
export const viewProfile = async (idUser) => {
    try {
        const user = await UserModel.findOne({
            attributes: ['userName', 'email', 'wallet', 'publicProfile', 'twitterAccount', 'instagramAccount', 'facebookAccount'],
            include: {
                model: RoleModel,
                required: true,
                attributes: ['idRole', 'name']
            }, where: { idUser: idUser }
        });

        if (user.publicProfile === 0) return null;
        return user;
    } catch (error) {
        throw error;
    }
}
