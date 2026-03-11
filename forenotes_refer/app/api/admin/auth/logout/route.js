import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully",
        });

        // Clear the cookie
        response.cookies.set({
            name: "adminToken",
            value: "",
            httpOnly: true,
            expires: new Date(0), // Expire immediately
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Admin Logout Error:", error);
        return NextResponse.json(
            { success: false, error: "Server error during logout" },
            { status: 500 }
        );
    }
}
