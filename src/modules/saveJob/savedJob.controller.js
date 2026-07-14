import catchAsync from "../../utils/catchAsync.js";
import SavedJob from "./saveJob.model.js";


export const toggleSaveJob = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { jobId } = req.params;

    if (!jobId) {
        return res.status(400).json({
            success: false,
            message: "Job ID is required.",
        });
    }

    const existingSave = await SavedJob.findOne({ userId, jobId });

    if (existingSave) {
        await SavedJob.findByIdAndDelete(existingSave._id);

        return res.status(200).json({
            success: true,
            isSaved: false,
            message: "Job removed from saved list.",
        });
    }

    await SavedJob.create({ userId, jobId });

    res.status(201).json({
        success: true,
        isSaved: true,
        message: "Job saved successfully.",
    });
});

export const getSavedJobs = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const savedJobs = await SavedJob.find({ userId })
        .populate("jobId")
        .sort({ createdAt: -1 });

    const jobs = savedJobs
        .filter((item) => item.jobId !== null)
        .map((item) => item.jobId);

    res.status(200).json({
        success: true,
        count: jobs.length,
        data: jobs,
    });
});