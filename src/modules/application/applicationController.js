import mongoose from "mongoose";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

export const applyJob = catchAsync(async (req, res) => {
    const body = req.body;
    let currentUser = req.user;

    if (currentUser.approvalStatus === "pending") {
        throw new AppError(403, "Your profile is pending admin approval. You cannot apply for jobs yet.")
    }

    if (currentUser.approvalStatus === "rejected") {
        throw new AppError(403, "Your profile approval request was rejected.")
    }

    const today = new Date();
    const lastAction = new Date(currentUser.last);

    const isNewMonth = today.getMonth() !== lastAction.getMonth() || today.getFullYear() !== lastAction.getFullYear();

    if (isNewMonth) {
        await mongoose.connection.collection("user").updateOne(
            { _id: currentUser.id },
            {
                $set: {
                    usageCount: 0,
                    lastActionDate: today
                }
            }
        )
        currentUser.usageCount = 0;
    }

    const seekerLimits = { free: 3, pro: 50, premium: 100 };
    const userPlan = currentUser.plan || "free";
    const maxAllowedApplies = seekerLimits[userPlan];

    if (currentUser.usageCount >= maxAllowedApplies) {
        throw new AppError(403, `You have reached your monthly job application limit (${maxAllowedApplies}) for the ${userPlan} plan.`);
    }

    const parsed = applyJobSchema.safeParse(body);

    if (!parsed.success) {
        throw new AppError(400, "Validation failed. Please check your links.");
    }

    const targetJob = await Job.findOne({ _id: parsed.data.jobId });
    if (!targetJob) {
        throw new AppError(404, "The job you are trying to apply for does not exist.");
    }

    const recruiterId = targetJob.author_id;

    const alreadyApplied = await Application.findOne({
        jobId: parsed.data.jobId,
        seekerId: currentUser.id
    });

    if (alreadyApplied) {
        throw new AppError(400, "You have already applied for this job.");
    }

    const newApplication = await Application.create({
        ...parsed.data,
        seekerId: currentUser.id,
        recruiterId: recruiterId,
        status: "pending"
    });

    await mongoose.connection.collection("user").updateOne(
        { _id: currentUser.id },
        {
            $inc: { usageCount: 1 },
            $set: { lastActionDate: today }
        }
    );

    res.status(201).json({
        success: true,
        message: `Applied for the job successfully. (${currentUser.usageCount + 1}/${maxAllowedApplies} used this month)`,
        application: newApplication
    });
})