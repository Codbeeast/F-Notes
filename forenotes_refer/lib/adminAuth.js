import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";

/**
 * Validates the custom admin JWT token from cookies.
 * It does NOT rely on Clerk.
 *
 * @returns {object|null} The decoded admin info or null if unauthorized.
 */
export async function authenticateAdmin() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("adminToken")?.value;

        if (!token) {
            return null; // No token found
        }

        // Verify token
        const secret = process.env.ADMIN_JWT_SECRET || "fallback_secret_for_dev_only";
        const decoded = jwt.verify(token, secret);

        if (!decoded || !decoded.id) {
            return null; // Invalid token
        }

        await connectDB();

        // Optionally verify it still exists in the DB (can be skipped for speed, but safer to check)
        const admin = await Admin.findById(decoded.id).select("-password -__v");

        if (!admin || admin.role !== "admin") {
            return null; // Admin deleted or role revoked
        }

        // Return a clean object with necessary admin context
        return {
            id: admin._id,
            name: admin.name,
            email: admin.email,
        };
    } catch (error) {
        console.warn("Admin Auth Error or Expired Token:", error.message);
        return null;
    }
}

/**
 * Drops in backward compatibility with the previous requireAdmin helper.
 * Returns either the admin object, or throws a 403 Response if unauthorized.
 */
export async function requireAdmin() {
    const admin = await authenticateAdmin();

    if (!admin) {
        return {
            isAdmin: false,
            error: {
                message: "Unauthorized. Admin privileges required.",
                status: 403
            }
        };
    }

    return {
        isAdmin: true,
        userId: admin.id,
        ...admin
    };
}
