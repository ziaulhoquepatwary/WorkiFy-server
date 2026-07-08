import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { applyJob, deleteApplication, getJobApplicants, getMyApplications, getSingleApplication } from "./application.controller.js";
import restrictTo from "../../middleware/restrictRoll.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.post("/", verifyToken, restrictTo(ROLES.SEEKER), applyJob);
router.get("/my-applications", verifyToken, restrictTo(ROLES.SEEKER), getMyApplications);
router.get("/:id", verifyToken, restrictTo(ROLES.SEEKER), getSingleApplication);
router.get("/:jobId", verifyToken, restrictTo(ROLES.RECRUITER), getJobApplicants)
router.delete("/:id", verifyToken, restrictTo(ROLES.SEEKER), deleteApplication);

export default router;