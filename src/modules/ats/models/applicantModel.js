import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema(
  {
    organisation: {
      type: String,
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },
    candidateName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    appliedRole: {
      type: String,
      default: "Applicant",
    },
    linkedinUrl: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    sourcedVia: {
      type: String,
      default: null,
    },
    attachmentsText: {
      type: String,
      default: "1 Attachments (Resume, Portfolio)",
    },
    stage: {
      type: String,
      enum: ["Applied", "Screening", "Interview", "Offered", "Hired", "Rejected"],
      default: "Applied",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Applicant = mongoose.model("Applicant", applicantSchema);

export default Applicant;
