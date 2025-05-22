import { Router } from "express";
import { getOptions } from "../controller/options.controller";
import { smartCache } from "../middlewares/smartCache.middleware";

const router = Router();
router.get("/options/:concept", smartCache(), getOptions);

export default router;
