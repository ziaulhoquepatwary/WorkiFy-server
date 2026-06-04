import mongoose, { model } from 'mongoose';

const jobSchema = new Schema(
    {
        job_title: { type: String, required: true, trim: true },
        job_category: {
            type: String,
            required: true,
            enum: ["Software & IT", "Marketing", "Design", "Healthcare"]
        },
        job_type: {
            type: String,
            required: true,
            enum: ["Full-time", "Part-time", "Internship"],
            default: "Full-time"
        },
        work_mode: {
            type: String,
            required: true,
            enum: ["On-site", "Remote", "Hybrid"],
            default: "On-site"
        },
        vacancy: { type: Number, required: true, min: 1 },

        salary_min: { type: Number, default: 0 },
        salary_max: { type: Number },
        location: { type: String, required: true, trim: true },

        experience_level: {
            type: String,
            required: true,
            enum: ["Entry", "Mid", "Senior"]
        },
        experience_years: { type: Number, required: true, min: 0 },
        required_skills: { type: [String], required: true },

        responsibilities: { type: String, required: true },
        requirements: { type: String, required: true },
        benefits: { type: String, trim: true },

        application_deadline: { type: Date, required: true },

        author_id: { type: String, required: true },
        author_name: { type: String, required: true, trim: true },
        author_email: { type: String, required: true, trim: true },

        applicants_count: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["active", "expired", "draft"],
            default: "active"
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;