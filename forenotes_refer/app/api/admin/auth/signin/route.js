import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";

export async function POST(request) {
    try {
        await connectDB();

        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "Please provide an email and password" },
                { status: 400 }
            );
        }

        // Check if admin exists and password matches
        const admin = await Admin.findOne({ email }).select("+password");

        if (!admin) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }

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
        console.error("Admin Signin Error:", error);
        return NextResponse.json(
            { success: false, error: "Server error during sign in" },
            { status: 500 }
        );
    }
}
