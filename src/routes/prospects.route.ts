import { Router } from "express";
import {
  contactProspect,
  createProspect,
  getActiveProspects,
  getProspectById,
  updateProspect,
  deleteProspect,
  markAsAttended,
} from "../controller/prospects.controller";
import { sendUnattendedProspectsEmail } from "../services/prospect.service";

const router = Router();

router.post("/prospect/contact", contactProspect);
router.post("/prospect/manage", createProspect);
router.get("/prospect/manage", getActiveProspects);
router.get("/prospect/unattended", sendUnattendedProspectsEmail);
router.get("/prospect/manage/:id", getProspectById);
router.put("/prospect/manage/:id", updateProspect);
router.delete("/prospect/manage/:id", deleteProspect);
router.post("/prospect/:id/atender", markAsAttended);

export default router;
