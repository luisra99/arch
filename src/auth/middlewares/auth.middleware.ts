import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/jwt";
import { logger } from "../../utils/logger";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const { token } = req.cookies;
    // if (!token) {
    //   return res
    //     .status(401)
    //     .clearCookie("token")
    //     .json({ error: "Unauthorized" });
    // }

    // const { payload, newToken } = verifyToken(token);
    // if (!payload) {
    //   return res
    //     .clearCookie("token")
    //     .status(401)
    //     .json({ error: "Invalid token" });
    // }
    // req.body.user = payload;
    // const headers = new Headers({ token: newToken });
    // res.setHeaders(headers);
    next();
  } catch (error: any) {
    logger.error(error.stack + " " + req);
  }
};
