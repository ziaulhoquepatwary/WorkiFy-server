import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
    {
        jobId: { type: String, required: true },
        seekerId: { type: String, required: true },
        recruiterId: { type: String, required: true },
        resumeUrl: { type: String, required: true },
        coverLetter: { type: String, default: "" },
        linkedinUrl: { type: String, default: "" },
        portfolioUrl: { type: String, default: "" },
        otherLink: { type: String, default: "" },
        status: {
            type: String,
            enum: ["pending", "interview", "selected", "rejected"],
            default: "pending",
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Application = mongoose.model("Application", ApplicationSchema);
export default Application;