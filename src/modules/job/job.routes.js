import express from "express";
import { createJob, getAllJobs, getJobDetails, getMyJobs, getRecruiterJobs } from "./job.controllers.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import restrictTo from "../../middleware/restrictRoll.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/my-created-job", verifyToken, restrictTo(ROLES.RECRUITER), getRecruiterJobs);
router.get("/my-posted-jobs", verifyToken, restrictTo(ROLES.RECRUITER), getMyJobs);
router.get("/:id", getJobDetails);
router.post("/", verifyToken, restrictTo(ROLES.RECRUITER), createJob);

export default router;