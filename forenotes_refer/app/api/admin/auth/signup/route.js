import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";

export async function POST(request) {
    try {
        await connectDB();

        // Check if signup is enabled
        const isSignupEnabled = process.env.ADMIN_SIGNUP_ENABLED !== "false";
        if (!isSignupEnabled) {
            return NextResponse.json(
                { success: false, error: "Admin registration is currently restricted" },
                { status: 403 }
            );
        }

        const { name, email, password, adminSecret } = await request.json();

        // Very basic protection for creating the FIRST admin or other admins
        // In production, you'd store ADMIN_CREATION_SECRET in .env
        const expectedSecret = process.env.ADMIN_CREATION_SECRET || "forenotes_setup_2026";

        if (adminSecret !== expectedSecret) {
            return NextResponse.json(
                { success: false, error: "Invalid admin creation secret" },
                { status: 403 }
            );
        }

        // Check if admin already exists
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return NextResponse.json(
                { success: false, error: "Admin already exists" },
                { status: 400 }
            );
        }

        // Create admin
        const admin = await Admin.create({
            name,
            email,
            password,
        });

        // Generate JWT Token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.ADMIN_JWT_SECRET || "fallback_secret_for_dev_only",
            { expiresIn: "7d" }
        );

        // Set cookie response
        const response = NextResponse.json({
            success: true,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });

        response.cookies.set({
            name: "adminToken",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Admin Signup Error:", error);
        return NextResponse.json(
            { success: false, error: "Server error during admin setup" },
            { status: 500 }
        );
    }
}
