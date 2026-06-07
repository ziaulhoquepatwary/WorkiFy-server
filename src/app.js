import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jobRouter from "./modules/job/job.routes.js";
import { toNodeHandler } from "better-auth/node";
import globalErrorHandler from "./middleware/globalErrorHandler.js";

const createApp = (auth) => {
    const app = express();

    app.use(cors({
        origin: [
            process.env.FRONTEND_URL,
            "http://localhost:3000",
        ].filter(Boolean),
        credentials: true
    }));

    app.use(cookieParser());
    app.use(express.json());

    app.all("/api/auth/*splat", toNodeHandler(auth));

    app.use("/api/jobs", jobRouter);

    app.get("/", (req, res) => {
        res.send("Workify server is running successfully");
    });

    app.use(globalErrorHandler);

    return app;
};

export default createApp;