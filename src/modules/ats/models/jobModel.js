import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    organisation: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: "Engineering",
    },
    jobType: {
      type: String,
      enum: ["Full Time", "Part Time", "Contract", "Internship"],
      default: "Full Time",
    },
    workplaceType: {
      type: String,
      enum: ["Remote", "Hybrid", "On-Site"],
      default: "Remote",
    },
    location: {
      type: String,
      default: "Remote",
    },
    deadline: {
      type: Date,
      default: null,
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
