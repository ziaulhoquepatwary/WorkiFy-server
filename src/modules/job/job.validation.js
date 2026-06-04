import { z } from "zod";

export const jobValidationSchema = z.object({
    body: z.object({
        job_title: z.string({
            required_error: "Job title is required",
        }).trim().min(3, "Title must be at least 3 characters"),

        job_category: z.enum(["Software & IT", "Marketing", "Design", "Healthcare"], {
            required_error: "Job category is required",
        }),

        job_type: z.enum(["Full-time", "Part-time", "Internship"], {
            required_error: "Job type is required",
        }),

        work_mode: z.enum(["On-site", "Remote", "Hybrid"], {
            required_error: "Work mode is required",
        }),

        vacancy: z.preprocess(
            (val) => Number(val),
            z.number({ required_error: "Vacancy count is required" }).min(1, "Vacancy must be at least 1")
        ),

        salary_min: z.preprocess(
            (val) => (val === "" || val === undefined ? undefined : Number(val)),
            z.number().min(0, "Minimum salary cannot be negative").optional()
        ),

        salary_max: z.preprocess(
            (val) => (val === "" || val === undefined ? undefined : Number(val)),
            z.number().min(0, "Maximum salary cannot be negative").optional()
        ).optional(),

        location: z.string({
            required_error: "Location is required",
        }).trim().min(2, "Location is too short"),

        experience_level: z.enum(["Entry", "Mid", "Senior"], {
            required_error: "Experience level is required",
        }),

        experience_years: z.preprocess(
            (val) => Number(val),
            z.number({ required_error: "Experience years is required" }).min(0, "Experience cannot be negative")
        ),

        required_skills: z.array(z.string()).min(1, "Please add at least one skill"),

        responsibilities: z.string({
            required_error: "Responsibilities description is required",
        }).trim().min(10, "Responsibilities description must be at least 10 characters"),

        requirements: z.string({
            required_error: "Requirements description is required",
        }).trim().min(10, "Requirements description must be at least 10 characters"),

        benefits: z.string().trim().optional(),

        application_deadline: z.string({
            required_error: "Application deadline date is required",
        }).refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid date format",
        }),
    }),
});