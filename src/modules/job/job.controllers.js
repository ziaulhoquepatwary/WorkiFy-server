import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Job from "./job.model.js";
import { jobValidationSchema } from "./job.validation.js";

export const createJob = catchAsync(async (req, res) => {
    const body = req.body;

    console.log("Logged In User Info:", req.user);

    // console.log("---------------- BACKEND CHECK START ----------------");
    // console.log("GET JOB Data:", req.body);
    // console.log("GET Cookies:", req.cookies);
    // console.log("----------------- BACKEND CHECK END -----------------");

    const parsed = jobValidationSchema.safeParse(body);

    if (!parsed.success) {
        throw new AppError(400, "Validation failed")
    }

    const newJob = await Job.create({
        ...parsed.data,
        author_id: req.user.id,
        author_name: req.user.name,
        author_email: req.user.email,
    });

    res.status(201).json({
        success: true,
        message: "Job Create Successfully",
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

    const jobs = await Job.find({ author_id: recruiterId }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: jobs.length,
        jobs
    })
})

export const getJobDetails = catchAsync(async (req, res) => {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
        throw new AppError(404, "Job not found or has been removed")
    }

    const isExpired = new Date(job.application_deadline) < new Date();

    res.status(200).json({
        success: true,
        message: "Job details fetched successfully",
        isExpired,
        job
    })
})