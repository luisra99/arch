import { Router } from "express";
import { createConceptController, deleteConceptController, getConceptByIdController, getConceptsController, updateConceptController } from "./controllers/concept.controller";
import { resetCache, smartCache } from "@middlewares/smartCache.middleware";
import { clearCacheMiddleware } from "@libs/cache";
import { clearCacheController, getAllLogsController, getErrorsLogsController } from "./controllers/debug.controller";
import { deleteUserController, listUsersController, updateUserController } from "./controllers/users.controller";

const router = Router();
///Concepts
router.post(
  "/concept/:fatherDenomination",
  resetCache("/concept"),
  createConceptController
);
router.get("/concept-list/:fatherDenomination", smartCache(), getConceptsController);
router.get("/concept/:id", getConceptByIdController);
router.put("/concept/:id", clearCacheMiddleware, updateConceptController);
router.delete("/concept/:id", resetCache("/options"), deleteConceptController);
///Cache
router.get("/clear",clearCacheController );
//Logs
router.get("/get-logs/error", getErrorsLogsController);
router.get("/get-logs/all", getAllLogsController );
///Users
router.get("/users/list", listUsersController);
router.delete("/user/:id", deleteUserController);
router.get("/user/:id", listUsersController);
router.put("/user/:id", updateUserController);
export default router;
