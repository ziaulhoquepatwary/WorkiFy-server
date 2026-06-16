import express from "express";
import { protectRoute } from "../../middleware/authMiddleware.js";
import { applyJob, getJobApplicants, getMyApplications } from "./application.controller.js";
import restrictTo from "../../middleware/restrictRoll.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.post("/", protectRoute, restrictTo(ROLES.SEEKER), applyJob);
router.get("/my-applications", protectRoute, restrictTo(ROLES.SEEKER), getMyApplications);
router.get("/:jobId", protectRoute, getJobApplicants)

export default router;