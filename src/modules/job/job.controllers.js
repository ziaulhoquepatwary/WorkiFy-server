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