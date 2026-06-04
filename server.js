import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import createApp from "./src/app.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected successfully!");

        createApp.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start the server:", error);
    }
};

startServer();