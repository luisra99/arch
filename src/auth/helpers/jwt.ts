import logger from "../../libs/logger";
import jwt from "jsonwebtoken";

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
 export const parseJwt = (token:string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  };