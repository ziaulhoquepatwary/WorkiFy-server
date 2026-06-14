import { z } from "zod";

export const applyJobSchema = z.object({
    jobId: z.string({ required_error: "Job ID is required" }),
    resumeUrl: z.string().url("Please provide a valid URL for your resume"),
    coverLetter: z.string().url("Invalid CoverLetter URL").optional(),
    linkedinUrl: z.string().url("Invalid LinkedIn URL").optional(),
    portfolioUrl: z.string().url("Invalid Portfolio URL"),
    otherLink: z.string().url("Invalid Link").optional(),
})