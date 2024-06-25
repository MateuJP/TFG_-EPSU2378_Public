import { body } from "express-validator";

export const loginValidationRules = () => [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().isString().trim()
];