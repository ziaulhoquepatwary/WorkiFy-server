import express from "express";
import { createJob, getAllJobs, getJobDetails, getRecruiterJobs } from "./job.controllers.js";
import { protectRoute } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/my-created-job", protectRoute, getRecruiterJobs);
router.get("/:id", protectRoute, getJobDetails)
router.post("/", protectRoute, createJob);

export default router;