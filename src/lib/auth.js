import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

export const createAuth = (db) => {
    return betterAuth({
        database: mongodbAdapter(db),

        baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",

        session: {
            expiresIn: "7d",

            fields: {
                user: [
                    "role",
                    "approvalStatus",
                    "plan",
                    "usageCount",
                    "lastActionDate",
                    "phoneNumber",
                    "bio",
                ],
            },
        },

        user: {
            additionalFields: {
                role: {
                    type: "string",
                },
                approvalStatus: {
                    type: "string",
                },
                phoneNumber: {
                    type: "string",
                },
                bio: {
                    type: "string",
                },
                plan: {
                    type: "string",
                },
                usageCount: {
                    type: "number",
                },
                lastActionDate: {
                    type: "date",
                },
            },
        },
    });
};