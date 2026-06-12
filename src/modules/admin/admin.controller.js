import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import mongoose from "mongoose";

export const getPendingRecruiters = catchAsync(async (req, res) => {
    const recruiters = await mongoose.connection.collection("user")
        .find({
            role: "recruiter",
            approvalStatus: "pending",
            emailVerified: true,
            phoneNumber: { $ne: "" }
        })
        .toArray();

    res.status(200).json({
        success: true,
        count: recruiters.length,
        recruiters
    });
});

export const getPendingSeekers = catchAsync(async (req, res) => {
    const seekers = await mongoose.connection.collection("user")
        .find({
            role: "seeker",
            approvalStatus: "pending",
            // emailVerified: true,
            phoneNumber: { $ne: "" }
        })
        .toArray();

    res.status(200).json({
        success: true,
        count: seekers.length,
        seekers
    });
});

export const updateApprovalStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!["approved", "rejected"].includes(approvalStatus)) {
        throw new AppError(400, "Invalid approval status");
    }

    const result = await mongoose.connection.collection("user").updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        {
            $set: {
                approvalStatus,
                updatedAt: new Date()
            }
        }
    );

    if (result.matchedCount === 0) {
        throw new AppError(404, "User not found");
    }

    res.status(200).json({
        success: true,
        message: `User ${approvalStatus} successfully`
    });
});