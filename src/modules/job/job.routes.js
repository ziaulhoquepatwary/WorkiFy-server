import express from "express";
import { createJob, getAllJobs } from "./job.controllers.js";
import { protectRoute } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllJobs);
router.post("/", protectRoute, createJob);

export default router;