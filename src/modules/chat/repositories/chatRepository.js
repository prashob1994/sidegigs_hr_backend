import { v4 as uuidv4 } from "uuid";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";

class ChatRepository {
  /**
   * Find existing conversation or create a new one initiated by HR
   */
  async findOrCreateConversationByHr({
    hr_id,
    user_id,
    job_id = null,
    organisation = "sidegigs",
    hr_name = "HR Team",
    user_name = "Candidate",
    user_avatar = null,
  }) {
    const query = { hr_id: Number(hr_id), user_id: Number(user_id) };
    if (job_id) {
      query.job_id = Number(job_id);
    }

    let conversation = await Conversation.findOne(query);

    if (!conversation) {
      const generatedId = `conv_${hr_id}_${user_id}_${job_id ? `${job_id}_` : ""}${Date.now()}`;
      conversation = await Conversation.create({
        conversation_id: generatedId,
        organisation,
        hr_id: Number(hr_id),
        hr_name,
        user_id: Number(user_id),
        user_name,
        user_avatar,
        job_id: job_id ? Number(job_id) : null,
        initiated_by: "hr",
        is_hr_initiated: true,
        last_message: "",
        last_message_time: new Date(),
        status: "active",
      });
    }

    return conversation;
  }

  /**
   * Check if an active conversation initiated by HR exists for the external user
   */
  async findActiveConversationForUser({ conversation_id, hr_id, user_id, job_id }) {
    if (conversation_id) {
      return await Conversation.findOne({
        conversation_id,
        is_hr_initiated: true,
        status: { $ne: "closed" },
      });
    }

    const query = {
      user_id: Number(user_id),
      is_hr_initiated: true,
      status: { $ne: "closed" },
    };

    if (hr_id) {
      query.hr_id = Number(hr_id);
    }
    if (job_id) {
      query.job_id = Number(job_id);
    }

    return await Conversation.findOne(query).sort({ updatedAt: -1 });
  }

  /**
   * Find conversation by conversation_id
   */
  async findConversationById(conversation_id) {
    return await Conversation.findOne({ conversation_id });
  }

  /**
   * List conversations for HR
   */
  async listConversationsByHr(hr_id, organisation) {
    const query = { hr_id: Number(hr_id) };
    if (organisation) {
      query.organisation = organisation;
    }
    return await Conversation.find(query).sort({ last_message_time: -1 });
  }

  /**
   * Store message in MongoDB and update conversation meta
   */
  async createMessage(data) {
    const messageId = data.message_id || `msg_${uuidv4()}`;

    const message = await Message.create({
      message_id: messageId,
      conversation_id: data.conversation_id,
      sender_type: data.sender_type,
      sender_id: Number(data.sender_id),
      sender_name: data.sender_name || "",
      receiver_type: data.receiver_type,
      receiver_id: Number(data.receiver_id),
      message: data.message,
      attachments: data.attachments || [],
      status: data.status || "sent",
      sync_status: data.sync_status || "synced",
      external_message_id: data.external_message_id || null,
    });

    // Update conversation metadata
    const updateData = {
      last_message: data.message,
      last_message_time: message.createdAt || new Date(),
    };

    if (data.sender_type === "hr") {
      updateData.$inc = { unread_user_count: 1 };
    } else {
      updateData.$inc = { unread_hr_count: 1 };
    }

    await Conversation.findOneAndUpdate(
      { conversation_id: data.conversation_id },
      updateData
    );

    return message;
  }

  /**
   * List messages in a conversation
   */
  async listMessages(conversation_id, { limit = 100, skip = 0 } = {}) {
    return await Message.find({ conversation_id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);
  }

  /**
   * Mark messages as read by reader
   */
  async markMessagesRead(conversation_id, reader_type = "hr") {
    // If HR is reading, mark messages sent by user as read
    const targetSender = reader_type === "hr" ? "user" : "hr";

    await Message.updateMany(
      { conversation_id, sender_type: targetSender, status: { $in: ["sent", "delivered"] } },
      { status: "read" }
    );

    if (reader_type === "hr") {
      await Conversation.findOneAndUpdate({ conversation_id }, { unread_hr_count: 0 });
    } else {
      await Conversation.findOneAndUpdate({ conversation_id }, { unread_user_count: 0 });
    }

    return true;
  }
}

export default new ChatRepository();
