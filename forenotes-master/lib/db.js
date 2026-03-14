import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  // Use environment variable or fallback to localhost
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

  try {
    console.log('Attempting MongoDB connection...');
    await mongoose.connect(mongoUri, {
      dbName: "tradejournal",
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully to tradejournal database');
  } catch (error) {
    // Always log connection errors - this is critical
    console.error('❌ MongoDB connection error:', error.message);
    console.error('MongoDB URI (masked):', mongoUri.replace(/\/\/.*@/, '//<credentials>@'));

    // Re-throw the error so API routes know the connection failed
    throw new Error(`Database connection failed: ${error.message}`);
  }
};
