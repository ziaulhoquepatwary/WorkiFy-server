import express from "express";
import { createJob, getAllJobs, getJobDetails, getRecruiterJobs } from "./job.controllers.js";
import { protectRoute } from "../../middleware/authMiddleware.js";
import restrictTo from "../../middleware/restrictRoll.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/my-created-job", protectRoute, restrictTo(ROLES.RECRUITER), getRecruiterJobs);
router.get("/:id", getJobDetails)
router.post("/", protectRoute, restrictTo(ROLES.RECRUITER), createJob);

export default router;