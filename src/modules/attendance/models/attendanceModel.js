import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["clock_in", "clock_out"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
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
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    clockInTime: {
      type: Date,
      required: true,
    },
    clockOutTime: {
      type: Date,
      default: null,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["clocked_in", "clocked_out"],
      default: "clocked_in",
    },
    logs: [logSchema],
  },
  {
    timestamps: true,
  }
);

// Composite index for fast lookups
attendanceSchema.index({ employeeId: 1, date: 1, organisation: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
