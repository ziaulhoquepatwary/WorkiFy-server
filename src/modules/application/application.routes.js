import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { applyJob, deleteApplication, getJobApplicants, getMyApplications, getSingleApplication, updateApplicationStatus } from "./application.controller.js";
import restrictTo from "../../middleware/restrictRoll.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.post("/", verifyToken, restrictTo(ROLES.SEEKER), applyJob);
router.get("/my-applications", verifyToken, restrictTo(ROLES.SEEKER), getMyApplications);
router.get("/:id", verifyToken, restrictTo(ROLES.SEEKER), getSingleApplication);
router.get("/job-applicants/:jobId", verifyToken, restrictTo(ROLES.RECRUITER), getJobApplicants);
router.patch("/status/:id", verifyToken, restrictTo(ROLES.RECRUITER), updateApplicationStatus)
router.delete("/:id", verifyToken, restrictTo(ROLES.SEEKER), deleteApplication);

export default router;