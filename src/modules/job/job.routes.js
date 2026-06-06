import express from "express";
import { createJob } from "./job.controllers.js";
import { protectRoute } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protectRoute, createJob);

export default router;