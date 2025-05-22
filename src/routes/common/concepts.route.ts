import { Router } from "express";
import {
  createConcept,
  updateConcept,
  deleteConcept,
  getConcepts,
  getConceptById,
} from "../../controller/common/concept.controller";
import {
  resetCache,
  smartCache,
} from "../../middlewares/smartCache.middleware";
import { clearCacheMiddleware } from "../../libs/cache";

const router = Router();

router.post(
  "/concept/:fatherDenomination",
  resetCache("/concept"),
  createConcept
);
router.get("/concept-list/:fatherDenomination", smartCache(), getConcepts);
router.get("/concept/:id", getConceptById);
router.put("/concept/:id", clearCacheMiddleware, updateConcept);
router.delete("/concept/:id", resetCache("/options"), deleteConcept);

export default router;
