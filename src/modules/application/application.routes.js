import express from "express";
import { protectRoute } from "../../middleware/authMiddleware.js";
import { applyJob } from "./application.controller.js";

const router = express.Router();

router.post("/", protectRoute, applyJob);

export default router;