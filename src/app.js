import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express(cors());

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Workify server is running successfully")
});

export default app;