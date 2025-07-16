import { Router } from "express";
import { downloadSharedContentController, sendShareLinkController } from "./controllers/share.controller";

const router = Router();

router.post("/send", sendShareLinkController);     // envía correo
router.get("/:token", downloadSharedContentController); // descarga única

export default router;
