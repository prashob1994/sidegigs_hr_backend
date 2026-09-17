import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    organisation: {
      type: String,
      required: true,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    employeeName: {
      type: String,
      required: true,
    },
    claimCode: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      default: "Travel & Fuel",
    },
    amount: {
      type: Number,
      required: true,
    },
    receiptVerified: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Claim = mongoose.model("Claim", claimSchema);

export default Claim;
