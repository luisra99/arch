import { Router } from "express";
import {
  contactProspect,
  createProspect,
  getActiveProspects,
  getProspectById,
  updateProspect,
  deleteProspect,
} from "../controller/prospects.controller";

const router = Router();

router.post("/prospect/contact", contactProspect);
router.post("/prospect/manage", createProspect);
router.get("/prospect/manage", getActiveProspects);
router.get("/prospect/manage/:id", getProspectById);
router.put("/prospect/manage/:id", updateProspect);
router.delete("/prospect/manage/:id", deleteProspect);

export default router;
