import express from "express";
import { getPendingRecruiters, getPendingSeekers, updateApprovalStatus } from "./admin.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import restrictTo from "../../middleware/restrictRoll.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.get("/getPendingRecruiters", verifyToken, restrictTo(ROLES.ADMIN), getPendingRecruiters);
router.get("/getPendingSeekers", verifyToken, restrictTo(ROLES.ADMIN), getPendingSeekers);
router.patch("/updateStatus/:id", verifyToken, restrictTo(ROLES.ADMIN), updateApprovalStatus);

export default router;