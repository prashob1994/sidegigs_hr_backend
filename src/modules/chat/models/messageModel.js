import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    message_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    conversation_id: {
      type: String,
      required: true,
      index: true,
    },
    sender_type: {
      type: String,
      enum: ["hr", "user"],
      required: true,
    },
    sender_id: {
      type: Number,
      required: true,
      index: true,
    },
    sender_name: {
      type: String,
      default: "",
    },
    receiver_type: {
      type: String,
      enum: ["hr", "user"],
      required: true,
    },
    receiver_id: {
      type: Number,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [
      {
        url: { type: String },
        file_type: { type: String },
        file_name: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    sync_status: {
      type: String,
      enum: ["synced", "pending_sync", "sync_failed"],
      default: "synced",
    },
    external_message_id: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversation_id: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
