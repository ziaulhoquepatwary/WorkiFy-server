import mongoose, { model, Schema } from 'mongoose';

const savedJobSchema = new Schema(
    {
        userId: { type: String, required: [true, "User ID is required"], index: true, },
        jobId: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: [true, "Job ID is required"],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const SavedJob = mongoose.model("SavedJob", savedJobSchema);
export default SavedJob;