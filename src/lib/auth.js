import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

export const createAuth = (db) => {

    const origins = [
        process.env.FRONTEND_URL,
        "http://localhost:3000"
    ]

    return betterAuth({
        database: mongodbAdapter(db),

        baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",

        emailAndPassword: {
            enabled: true,
        },

        socialProviders: {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
        },

        session: {
            cookieCache: {
                enabled: true,
                maxAge: 60 * 60 * 24 * 7
            },

            fields: {
                user: ["role", "approvalStatus", "plan", "usageCount", "lastActionDate", "phoneNumber"]
            }
        },

        user: {
            additionalFields: {
                role: {
                    type: "string",
                    defaultValue: "" // seeker, recruiter, admin
                },
                approvalStatus: {
                    type: "string",
                    defaultValue: "pending" // pending, approved, rejected
                },
                phoneNumber: {
                    type: "string",
                    defaultValue: ""
                },
                bio: {
                    type: "string",
                    defaultValue: ""
                },
                plan: {
                    type: "string",
                    defaultValue: "free" // free, pro, premium,
                },
                usageCount: {
                    type: "number",
                    defaultValue: 0
                },
                lastActionDate: {
                    type: "date",
                    defaultValue: new Date()
                }
            }
        },

        trustedOrigins: origins
    });
};