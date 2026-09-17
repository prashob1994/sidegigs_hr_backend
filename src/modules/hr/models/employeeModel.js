import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    organisation: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: "General",
    },
    designation: {
      type: String,
      default: "Employee",
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on_leave", "terminated"],
      default: "active",
    },
    reportsTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    workplaceType: {
      type: String,
      enum: ["On-Site", "Remote", "Hybrid"],
      default: "On-Site",
    },
    attendanceRate: {
      type: Number,
      default: 95,
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
