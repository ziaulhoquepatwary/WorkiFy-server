import express from "express";
import { getPendingRecruiters, getPendingSeekers, updateApprovalStatus } from "./admin.controller.js";
import { protectRoute } from "../../middleware/authMiddleware.js";
import restrictTo from "../../middleware/restrictRoll.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.get("/getPendingRecruiters", protectRoute, restrictTo(ROLES.ADMIN), getPendingRecruiters);
router.get("/getPendingSeekers", protectRoute, restrictTo(ROLES.ADMIN), getPendingSeekers);
router.patch("/updateStatus/:id", protectRoute, restrictTo(ROLES.ADMIN), updateApprovalStatus);

export default router;