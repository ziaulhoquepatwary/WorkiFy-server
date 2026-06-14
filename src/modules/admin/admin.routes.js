import express from "express";
import { getPendingRecruiters, getPendingSeekers, updateApprovalStatus } from "./admin.controller.js";
import { protectRoute } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/getPendingRecruiters", protectRoute, getPendingRecruiters);
router.get("/getPendingSeekers", protectRoute, getPendingSeekers);
router.patch("/updateStatus/:id", protectRoute, updateApprovalStatus);

export default router;