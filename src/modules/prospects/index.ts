import { answerProspectQuestionController, contactProspectController,  questionFromProspectController } from "@modules/prospects/controllers/mailing.prospect.controller";
import { sendUnattendedProspectsEmailService } from "@modules/prospects/services/mailing.prospect.service";
import { Router } from "express";
import { createProspectController, getActiveProspects, getProspectById, updateProspect, deleteProspect, markAsAttended } from "./controllers/manage.prospect.controller";

const router = Router();
//Mailing
router.post("/prospect/contact", contactProspectController);
router.post("/prospect/question", questionFromProspectController);
router.put("/prospect/answer", answerProspectQuestionController);
//Manage
router.post("/prospect/manage", createProspectController);
router.put("/prospect/manage/:id", updateProspect);
router.get("/prospect/manage", getActiveProspects);
router.get("/prospect/manage/:id", getProspectById);
router.delete("/prospect/manage/:id", deleteProspect);
router.post("/prospect/:id/atender", markAsAttended);
router.get("/prospect/unattended", sendUnattendedProspectsEmailService);

export default router;
