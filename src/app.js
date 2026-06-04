import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jobRouter from "./modules/job/job.routes.js";

const app = express(cors());

app.use(cookieParser());
app.use(express.json());


app.use("/api/jobs", jobRouter);

app.get("/", (req, res) => {
    res.send("Workify server is running successfully")
});

export default app;