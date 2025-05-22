import { Router } from "express";
import { getOptions } from "../../controller/common/options.controller";
import { smartCache } from "../../middlewares/smartCache.middleware";

const router = Router();
router.get("/options/:concept", smartCache(), getOptions);

export default router;
