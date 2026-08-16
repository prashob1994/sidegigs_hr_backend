import mongoose from "mongoose";
import seedHR from "./databaseSeeder.js";

/**
 * Function to connect to the MongoDB database and run seeders
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/sidgigs_hr_db";
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed initial HR account
    await seedHR();
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
