import express from "express";
import { createJob } from "./job.controllers.js";

const router = express.Router();

router.post("/", createJob);

export default router;