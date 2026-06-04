import Job from "./job.model.js";
import { jobValidationSchema } from "./job.validation.js";

export const createJob = async (req, res) => {
    try {
        const body = req.body;

        console.log(body);
        console.log(req.user);

        const session = await auth.api.getSession({ headers: req.headers });

        if (!session) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const user = session.user;

        const parsed = jobValidationSchema.safeParse(body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const newJob = await Job.create({
            ...parsed.data,
            author_id: user.id,
            author_name: user.name,
            author_email: user.email,
        })

        res.status(201).json({
            success: true,
            message: "Job Create Successfully",
            job: newJob
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}