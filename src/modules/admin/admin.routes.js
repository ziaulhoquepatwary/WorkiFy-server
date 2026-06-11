import express from "express";
import { getPendingRecruiters } from "./admin.controller.js";
import { protectRoute } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protectRoute, getPendingRecruiters);

export default router;