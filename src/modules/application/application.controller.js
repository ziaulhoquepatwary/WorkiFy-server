import mongoose from "mongoose";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import { applyJobSchema } from "./applicationValidator.js";
import Application from "./application.model.js";
import Job from "../job/job.model.js";

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
    const lastAction = new Date(currentUser.lastActionDate);

    const isNewMonth = today.getMonth() !== lastAction.getMonth() || today.getFullYear() !== lastAction.getFullYear();

    if (isNewMonth) {
        await mongoose.connection.collection("user").updateOne(
            { _id: new mongoose.Types.ObjectId(currentUser.id) },
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

    const updateResult = await mongoose.connection.collection("user").updateOne(
        { _id: new mongoose.Types.ObjectId(currentUser.id) },
        {
            $inc: { usageCount: 1 },
            $set: { lastActionDate: today }
        }
    );

    // console.log("Database Update Result:", updateResult);

    res.status(201).json({
        success: true,
        message: `Applied for the job successfully. (${currentUser.usageCount + 1}/${maxAllowedApplies} used this month)`,
        application: newApplication
    });
});

export const getMyApplications = catchAsync(async (req, res) => {
    const seekerId = req.user.id;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const myApplications = await Application.aggregate([
        {
            $match: {
                seekerId: seekerId
            }
        },
        {
            $addFields: {
                jobObjectId: { $toObjectId: "$jobId" }
            }
        },
        {
            $lookup: {
                from: "jobs",
                localField: "jobObjectId",
                foreignField: "_id",
                as: "jobDetails"
            }
        },
        {
            $unwind: {
                path: "$jobDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                jobId: 1,
                seekerId: 1,
                status: 1,
                createdAt: 1,
                "jobDetails.job_title": 1,
                "jobDetails.job_category": 1,
                "jobDetails.job_type": 1,
                "jobDetails.work_mode": 1,
                "jobDetails.location": 1
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: skip }, { $limit: limit }]
            }
        }
    ]);

    const applications = myApplications[0].data;
    const total = myApplications[0].metadata[0] ? myApplications[0].metadata[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
        success: true,
        message: "Your job applications retrieved successfully.",
        pagination: {
            totalApplications: total,
            totalPages,
            currentPage: page,
            limit
        },
        applications
    });
});

export const getSingleApplication = catchAsync(async (req, res) => {
    const { id } = req.params;

    const application = await Application.findById(id);

    if (!application) {
        throw new AppError(404, "Application not found.");
    }

    res.status(200).json({
        success: true,
        message: "Application details fetched successfully.",
        application
    });
});

export const deleteApplication = catchAsync(async (req, res) => {
    const { id } = req.params;
    const seekerId = req.user.id;

    const application = await Application.findById(id);

    if (!application) {
        return res.status(404).json({
            success: false,
            message: "Application not found."
        });
    }

    if (application.seekerId.toString() !== seekerId) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to delete this application."
        });
    }

    await Application.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: "Application deleted successfully."
    });
});

export const getJobApplicants = catchAsync(async (req, res) => {
    const { jobId } = req.params;
    const recruiterId = req.user.id;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const applicantsData = await Application.aggregate([
        {
            $match: {
                jobId: jobId,
                recruiterId: recruiterId
            }
        },
        {
            $addFields: {
                seekerObjectId: { $toObjectId: "$seekerId" }
            }
        },
        {
            $lookup: {
                from: "user",
                localField: "seekerObjectId",
                foreignField: "_id",
                as: "seekerDetails"
            }
        },
        {
            $unwind: { path: "$seekerDetails", preserveNullAndEmptyArrays: true }
        },
        {
            $project: {
                _id: 1,
                jobId: 1,
                status: 1,
                resumeUrl: 1,
                coverLetter: 1,
                linkedinUrl: 1,
                portfolioUrl: 1,
                createdAt: 1,
                "seekerDetails.name": 1,
                "seekerDetails.email": 1,
                "seekerDetails.image": 1
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: skip }, { $limit: limit }]
            }
        }
    ]);

    const applicants = applicantsData[0].data;
    const total = applicantsData[0].metadata[0] ? applicantsData[0].metadata[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
        success: true,
        message: "Applicants retrieved successfully.",
        pagination: {
            totalApplicants: total,
            totalPages,
            currentPage: page,
            limit
        },
        applicants
    });
});

export const updateApplicationStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const recruiterId = req.user.id;

    const validStatuses = ["pending", "interview", "selected", "rejected"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        });
    }

    const application = await Application.findById(id);

    if (!application) {
        return res.status(404).json({
            success: false,
            message: "Application not found."
        });
    }

    if (application.recruiterId.toString() !== recruiterId) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to update this application status."
        });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
        success: true,
        message: `Application status updated to '${status}' successfully.`,
        application
    });
});