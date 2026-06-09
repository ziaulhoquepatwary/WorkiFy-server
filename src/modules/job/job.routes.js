import express from "express";
import { createJob, getAllJobs, getRecruiterJobs } from "./job.controllers.js";
import { protectRoute } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/my-created-job", protectRoute, getRecruiterJobs);
router.post("/", protectRoute, createJob);

export default router;