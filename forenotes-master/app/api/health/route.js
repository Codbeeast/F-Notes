import { connectDB } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    await connectDB();
    const { userId } = auth();

    if (!userId) {
      return new Response(JSON.stringify({ 
        status: 'error', 
        message: 'Unauthorized' 
      }), { status: 401 });
    }

    return new Response(JSON.stringify({ 
      status: 'healthy', 
      message: 'Backend is connected and authenticated',
      timestamp: new Date().toISOString(),
      userId: userId
    }), { status: 200 });
  } catch (error) {
    console.error("Health check error:", error);
    return new Response(JSON.stringify({ 
      status: 'error', 
      message: 'Backend connection failed',
      error: error.message 
    }), { status: 500 });
  }
}