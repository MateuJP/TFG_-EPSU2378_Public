import dotenv from 'dotenv';
dotenv.config();

/**
 * Retrieves and returns the parameters defined in the .env file associated with the database configuration.
 */
export const configDB = {
    database: process.env['DATABASE'],
    host: process.env['HOST'],
    user: process.env['USER_DB'],
    dialect: process.env['DIALECT'],
    password: process.env['PASSWORD_BD']
};

/**
 * Retrieves and return an object with the parameters defined in the .env file associated with the JWT signature
 */
export const configJWT = {
    private_key: process.env['PRIVATE_KEY_JWT']
}