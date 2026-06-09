import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Job from "./job.model.js";
import { jobValidationSchema } from "./job.validation.js";

export const createJob = catchAsync(async (req, res) => {
    const body = req.body;

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

    let queryCondition = { status: "active" };

    if (search) {
        queryCondition.job_title = { $regex: search, $options: "i" };
    }

    if (category && category !== "All Categories") {
        queryCondition.job_category = category;
    }

    if (jobType) {
        const typesArray = jobType.split(",");
        queryCondition.job_type = { $in: typesArray };
    }

    if (maxSalary) {
        queryCondition.salary_min = { $lte: Number(maxSalary) };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(queryCondition)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const totalJobs = await Job.countDocuments(queryCondition);

    res.status(200).json({
        success: true,
        count: jobs.length,
        totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: Number(page),
        jobs,
    });
});