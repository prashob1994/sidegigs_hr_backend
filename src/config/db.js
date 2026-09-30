import mongoose from "mongoose";
import seedHR from "./databaseSeeder.js";

let isConnecting = false;

/**
 * Serverless-compatible MongoDB connection function with cached connection reuse
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn("⚠️ MONGO_URI is not defined in environment variables.");
      isConnecting = false;
      return null;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed initial HR account asynchronously without blocking connection
    seedHR().catch((err) => console.error("Seeder notice:", err.message));

    isConnecting = false;
    return conn;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    isConnecting = false;
    // Do NOT execute process.exit(1) on serverless environments like Vercel!
    return null;
  }
};

export default connectDB;
