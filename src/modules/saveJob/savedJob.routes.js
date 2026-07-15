import express from "express";
import { getSavedJobs, toggleSaveJob } from "./savedJob.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/saved", verifyToken, getSavedJobs);
router.post("/save/:jobId", verifyToken, toggleSaveJob);

export default router;