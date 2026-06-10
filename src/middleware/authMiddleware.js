import { fromNodeHeaders } from "better-auth/node";

export const protectRoute = async (req, res, next) => {
    try {
        const auth = req.app.get("auth");

        if (!auth) {
            throw new Error("Better Auth instance not found in app configuration.");
        }

        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session || !session.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized! Please login first."
            });
        }

        // console.log(session);


        req.user = {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            approvalStatus: session.user.approvalStatus,
            plan: session.user.plan,
            usageCount: session.user.usageCount,
            lastActionDate: session.user.lastActionDate
        };

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({
            success: false,
            message: "Session invalid or expired."
        });
    }
};