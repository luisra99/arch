import jwt from "jsonwebtoken";
import { logger } from "../../utils/logger";

const SECRET_KEY = "your_secret_key"; // Cambia esto a algo más seguro

export const generateToken = (payload: object, expiresIn: string = "2h"): string => {
    return jwt.sign(payload, SECRET_KEY);
};

export const verifyToken = (token: string): any => {
    try {
        const payload = jwt.verify(token, SECRET_KEY)
        const newToken = jwt.sign(payload, SECRET_KEY)
        return { payload, newToken }
    } catch (error) {
        logger.error(`Error verifying JWT token: ${error}`); // Log the error for debugging        
        return { payload: null };
    }
};