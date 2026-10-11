import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    organisation: {
      type: String,
      default: "sidegigs",
      trim: true,
      index: true,
    },
    hr_id: {
      type: Number,
      required: true,
      index: true,
    },
    hr_name: {
      type: String,
      trim: true,
      default: "HR Team",
    },
    user_id: {
      type: Number,
      required: true,
      index: true,
    },
    user_name: {
      type: String,
      trim: true,
      default: "Candidate / Worker",
    },
    user_avatar: {
      type: String,
      default: null,
    },
    job_id: {
      type: Number,
      default: null,
    },
    initiated_by: {
      type: String,
      enum: ["hr"],
      default: "hr",
    },
    is_hr_initiated: {
      type: Boolean,
      default: true,
    },
    last_message: {
      type: String,
      default: "",
    },
    last_message_time: {
      type: Date,
      default: Date.now,
    },
    unread_hr_count: {
      type: Number,
      default: 0,
    },
    unread_user_count: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "archived", "closed"],
      default: "active",
    },
    external_conversation_id: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ hr_id: 1, user_id: 1, job_id: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
