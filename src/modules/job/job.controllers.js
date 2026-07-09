import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Job from "./job.model.js";
import { jobValidationSchema } from "./job.validation.js";
import mongoose from "mongoose";

export const createJob = catchAsync(async (req, res) => {
    const body = req.body;
    let currentUser = req.user;

    if (currentUser.approvalStatus === "pending") {
        throw new AppError(403, "Your profile is pending admin approval. You cannot post jobs yet.")
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
        );

        currentUser.usageCount = 0;
    }

    const recruiterLimits = { free: 3, pro: 30, premium: 100 };
    const userPlan = currentUser.plan || "free";
    const maxAllowedJobs = recruiterLimits[userPlan];

    if (currentUser.usageCount >= maxAllowedJobs) {
        throw new AppError(403, `You have reached your monthly job post limit (${maxAllowedJobs}) for the ${userPlan} plan.`);
    }

    const parsed = jobValidationSchema.safeParse(body);

    if (!parsed.success) {
        throw new AppError(400, "Validation failed")
    }

    const newJob = await Job.create({
        ...parsed.data,
        author_id: currentUser.id,
        author_name: currentUser.name,
        author_email: currentUser.email,
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
        message: `Job Created Successfully. (${currentUser.usageCount + 1}/${maxAllowedJobs} used this month)`,
        job: newJob
    })
})

export const getAllJobs = catchAsync(async (req, res) => {
    const { search, category, jobType, maxSalary, page = 1, limit = 12 } = req.query;

    let matchStage = {
        status: "active",
        application_deadline: { $gte: new Date() }
    };

    if (search) {
        matchStage.job_title = { $regex: search, $options: "i" };
    }

    if (category && category !== "All Categories") {
        matchStage.job_category = category;
    }

    if (jobType) {
        matchStage.job_type = { $in: jobType.split(",") };
    }

    if (maxSalary) {
        matchStage.salary_min = { $lte: Number(maxSalary) };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },

        // add new fild: image for show company/recruter logo
        {
            $addFields: {
                author_objectId: { $toObjectId: "$author_id" }
            }
        },
        {
            $lookup: {
                from: "user",
                localField: "author_objectId",
                foreignField: "_id",
                as: "recruiter_info"
            }
        },

        {
            $project: {
                job_title: 1,
                job_category: 1,
                job_type: 1,
                work_mode: 1,
                location: 1,
                salary_min: 1,
                salary_max: 1,
                author_name: 1,
                createdAt: 1,
                application_deadline: 1,
                applicants_count: 1,
                author_image: { $arrayElemAt: ["$recruiter_info.image", 0] }
            }
        }
    ]);

    const totalJobs = await Job.countDocuments(matchStage);

    res.status(200).json({
        success: true,
        count: jobs.length,
        totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: Number(page),
        jobs,
    });
});

export const getRecruiterJobs = catchAsync(async (req, res) => {
    const recruiterId = req.user.id;

    const myJobs = await Job.aggregate([
        {
            $match: {
                author_id: recruiterId
            }
        },
        {
            $addFields: {
                jobIdString: { $toString: "$_id" }
            }
        },
        {
            $lookup: {
                from: "applications",
                localField: "jobIdString",
                foreignField: "jobId",
                as: "applications"
            }
        },
        {
            $project: {
                _id: 1,
                job_title: 1,
                job_category: 1,
                job_type: 1,
                work_mode: 1,
                vacancy: 1,
                salary_min: 1,
                salary_max: 1,
                location: 1,
                experience_level: 1,
                application_deadline: 1,
                status: 1,
                createdAt: 1,
                total_applications: { $size: "$applications" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    res.status(200).json({
        success: true,
        results: myJobs.length,
        message: "Recruiter jobs retrieved successfully.",
        jobs: myJobs
    });
})

export const getJobDetails = catchAsync(async (req, res) => {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
        throw new AppError(404, "Job not found or has been removed")
    }

    const recruiter = await mongoose.connection.collection("user").findOne(
        { _id: new mongoose.Types.ObjectId(job.author_id) }
    );

    const isExpired = new Date(job.application_deadline) < new Date();

    const jobDetails = {
        ...job.toObject(),
        author_image: recruiter?.image || null
    }

    res.status(200).json({
        success: true,
        message: "Job details fetched successfully",
        isExpired,
        job: jobDetails
    })
})

export const getMyJobs = catchAsync(async (req, res) => {
    const recruiterId = req.user.id;

    const jobs = await Job.find({ author_id: recruiterId }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        results: jobs.length,
        message: "Recruiter jobs fetched successfully.",
        jobs
    });
});