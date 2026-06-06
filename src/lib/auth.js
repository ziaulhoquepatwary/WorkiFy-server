import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";


export const createAuth = (db) => {
    return betterAuth({
        database: mongodbAdapter(db),

        baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",

        session: {
            expiresIn: "7d",
        }
    });
};