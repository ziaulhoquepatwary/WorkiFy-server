import catchAsync from "../../utils/catchAsync.js";

export const getPendingRecruiters = catchAsync(async (req, res) => {
    const db = req.app.get("auth").$db;

    const recruiters = await db.collection("user")
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
})