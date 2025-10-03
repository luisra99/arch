import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/jwt";
import logger from "../../libs/logger";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { headers:{authorization} } = req;
    const token=authorization?.split(" ")?.[1]
    if (!token) {
      return res
        .status(401)
        .clearCookie("token")
        .json({ error: "Unauthorized" });
    }

    const { payload, newToken } = verifyToken(token);
    if (!payload) {
      return res
        .clearCookie("token")
        .status(401)
        .json({ error: "Invalid token" });
    }
    req.body.user = payload;
    const header = new Headers({ token: newToken });
    res.setHeaders(header);
    next();
  } catch (error: any) {
    logger.error(error.stack + " " + req);
  }
};
