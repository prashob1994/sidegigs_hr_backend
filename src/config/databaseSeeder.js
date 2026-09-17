import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../modules/auth/models/userModel.js";
import { hashPassword } from "../utils/bcryptPassword.js";

dotenv.config();

/**
 * Seed base HR account (No dummy sample data added)
 */
const seedHR = async () => {
  try {
    const hrEmail = "info@gmail.com";
    const hrPassword = "Admin123,.";
    const hrOrganisation = "sidegigs";

    let existingHr = await User.findOne({ email: hrEmail });
    if (!existingHr) {
      const hashedPassword = await hashPassword(hrPassword);
      existingHr = await User.create({
        name: "HR Admin",
        email: hrEmail,
        password: hashedPassword,
        organisation: hrOrganisation,
        role: "hr",
        status: "active",
      });
      console.log(`✅ Base HR account created (${hrEmail})`);
    } else {
      console.log(`ℹ️ HR account (${hrEmail}) already present.`);
    }
  } catch (error) {
    console.error(`❌ Error seeding HR database: ${error.message}`);
  }
};

// Standalone execution helper
if (process.argv[1] && process.argv[1].endsWith("databaseSeeder.js")) {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/sidgigs_hr_db";
  mongoose
    .connect(mongoUri)
    .then(async () => {
      console.log("Connected to MongoDB...");
      await seedHR();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
}

export default seedHR;
