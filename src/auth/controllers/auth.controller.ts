import { Request, Response } from "express";
import { createUser, findUserByUsername, validatePassword } from "../models/User";
import { generateToken, parseJwt, verifyToken } from "../helpers/jwt";
import axios from "axios";
import logger from "../../libs/logger";
import { env } from "../../config/env";


export const register = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ error: "Username already exists" });
        }

        const user = await createUser({ username, password });
        res.status(201).json({ message: "User created successfully", user: { id: user.id, username: user.username } });
    } catch {
        logger.error("AuthController.register")
    }

};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const user = await findUserByUsername(username);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = await validatePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = generateToken({ id: user.id, username: user.username });
        res.cookie("token", token)
        res.status(200).json({ message: "Login successful", token });
    } catch (error: any) {
        logger.error("AuthController.login" + error.stack,)
    }

};

export const logout = (req: Request, res: Response) => {
    res.clearCookie("auth_token");
    res.status(200).json({ message: "Logged out successfully" });
};
export const signInWithGoogle = async (req: Request, res: Response) => {
    const { code } = req.query;
    try {
        const { data } = await axios.post('https://oauth2.googleapis.com/token', {
            code: code?.toString() || "",
            client_id: env.CLIENT_ID || "",
            client_secret: env.CLIENT_SECRET || "",
            redirect_uri: env.REDIRECT_URL || "",
            grant_type: 'authorization_code',
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });


        console.log(data)
        const idToken = data.id_token;

        let userInfo = parseJwt(idToken);
        console.log('User Info:', userInfo);
        const token = generateToken({ id: userInfo.sub, email: userInfo.email, name: userInfo.name, picture: userInfo.picture });
        userInfo.token = token
        res.cookie("token", token)
        res.status(200).json(userInfo);
    } catch (error) {
        console.log(error)
        getUserInfo(req, res)
    }
};

export const getUserInfo = async (req: Request, res: Response) => {
    try {
        const { token: _oldTokenCookie } = req.cookies;
        const { token: _oldTokenBody } = req.body;
        console.log({ _oldTokenCookie, _oldTokenBody })
        let { payload, newToken } = verifyToken(typeof (_oldTokenCookie ?? _oldTokenBody) == "string" ? _oldTokenCookie ?? _oldTokenBody : (_oldTokenCookie ?? _oldTokenBody).value)
        payload.token = newToken
        res.cookie("token", payload)
        return res.status(200).json(payload);
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
};