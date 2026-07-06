import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { applyJob, getJobApplicants, getMyApplications } from "./application.controller.js";
import restrictTo from "../../middleware/restrictRoll.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.post("/", verifyToken, restrictTo(ROLES.SEEKER), applyJob);
router.get("/my-applications", verifyToken, restrictTo(ROLES.SEEKER), getMyApplications);
router.get("/:jobId", verifyToken, getJobApplicants)

export default router;