import { Router } from "express";
import { downloadSharedContentController, sendShareLinkController } from "./controllers/share.controller";

const router = Router();

router.post("/share/send", sendShareLinkController);     // envía correo
router.get("/share/:token", downloadSharedContentController); // descarga única

export default router;
