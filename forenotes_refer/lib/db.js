import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
  }

  try {
    console.log('Attempting MongoDB connection...');
    await mongoose.connect(mongoUri, {
      dbName: "tradejournal",
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully to tradejournal database');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};
