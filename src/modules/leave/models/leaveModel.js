import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    organisation: {
      type: String,
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: ["sick", "casual", "annual", "unpaid"],
      default: "casual",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      default: 1,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: String,
      default: null,
    },
    leaveTitle: {
      type: String,
      default: "Leave Application",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    urgency: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
