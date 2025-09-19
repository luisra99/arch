import { Router } from "express";
import {
    getTreeController,
    downloadSignedZipController,
    shareFolderController, renameFileController,
    deleteFileController,
    uploadFileController,
    moveFileController,
} from "./controllers/file.controller";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "tmp/" });

router.get("/files/tree/:prospectId", getTreeController);
router.get("/files/tree", getTreeController);
router.get("/files/zip", downloadSignedZipController);
router.post("/files/share", shareFolderController);

router.post("/files/upload", upload.single("file"), uploadFileController);
router.post("/files/delete", deleteFileController);
router.post("/files/rename", renameFileController);
router.post("/files/move", moveFileController);


export default router;
