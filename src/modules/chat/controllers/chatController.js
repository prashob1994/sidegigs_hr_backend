import chatRepository from "../repositories/chatRepository.js";
import externalChatService from "../services/externalChatService.js";
import User from "../../auth/models/userModel.js";

/**
 * HR sends a message to an external app user
 * Initiates or continues conversation and forwards to external app API
 */
export const sendMessage = async (req, res) => {
  try {
    const organisation = req.params.organisation || req.user?.organisation || "sidegigs";
    const hrId = req.user?.key_id || 1;
    const hrName = req.user?.name || "HR Team";

    const {
      user_id,
      message,
      job_id,
      user_name,
      user_avatar,
      attachments,
    } = req.body;

    // 1. Find or create conversation in MongoDB initiated by HR
    const conversation = await chatRepository.findOrCreateConversationByHr({
      hr_id: hrId,
      hr_name: hrName,
      user_id,
      job_id,
      organisation,
      user_name: user_name || "Candidate",
      user_avatar: user_avatar || null,
    });

    // 2. Save message in MongoDB
    const savedMessage = await chatRepository.createMessage({
      conversation_id: conversation.conversation_id,
      sender_type: "hr",
      sender_id: hrId,
      sender_name: hrName,
      receiver_type: "user",
      receiver_id: user_id,
      message,
      attachments: attachments || [],
      status: "sent",
      sync_status: "pending_sync",
    });

    // 3. Forward message to External App API
    const forwardPayload = {
      message_id: savedMessage.message_id,
      conversation_id: conversation.conversation_id,
      sender_type: "hr",
      sender_id: hrId,
      sender_name: hrName,
      receiver_type: "user",
      receiver_id: user_id,
      message,
      attachments: attachments || [],
      job_id: conversation.job_id,
      created_at: savedMessage.createdAt,
    };

    const forwardResult = await externalChatService.forwardMessageToExternalApp(forwardPayload);

    // 4. Update sync status in MongoDB based on forward result
    if (forwardResult.success) {
      savedMessage.sync_status = "synced";
      savedMessage.status = "delivered";
      await savedMessage.save();
    } else {
      savedMessage.sync_status = "sync_failed";
      await savedMessage.save();
    }

    return res.status(201).json({
      status: true,
      message: forwardResult.success
        ? "Message sent and forwarded to external app user successfully"
        : "Message stored in MongoDB (forwarding to external app pending/failed)",
      data: {
        message: savedMessage,
        conversation,
        externalDelivery: forwardResult,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

/**
 * External App calls this webhook when external user replies to a conversation
 * STRICT RULE: External user can ONLY reply to an existing HR-initiated conversation!
 */
export const receiveIncomingMessage = async (req, res) => {
  try {
    const {
      sender_id,
      hr_id,
      receiver_id,
      conversation_id,
      message,
      sender_name,
      job_id,
      external_message_id,
      attachments,
    } = req.body;

    const targetHrId = hr_id || receiver_id;

    // 1. Verify that an active conversation initiated by HR exists in MongoDB
    const conversation = await chatRepository.findActiveConversationForUser({
      conversation_id,
      hr_id: targetHrId,
      user_id: sender_id,
      job_id,
    });

    if (!conversation || !conversation.is_hr_initiated) {
      return res.status(403).json({
        status: false,
        message: "External users can only reply to a conversation initiated by HR. No active HR conversation found.",
      });
    }

    // 2. Save incoming message into MongoDB
    const savedMessage = await chatRepository.createMessage({
      conversation_id: conversation.conversation_id,
      sender_type: "user",
      sender_id,
      sender_name: sender_name || conversation.user_name || "Candidate",
      receiver_type: "hr",
      receiver_id: conversation.hr_id,
      message,
      attachments: attachments || [],
      status: "delivered",
      sync_status: "synced",
      external_message_id: external_message_id || null,
    });

    return res.status(200).json({
      status: true,
      message: "Incoming message saved to MongoDB successfully",
      data: {
        message_id: savedMessage.message_id,
        conversation_id: conversation.conversation_id,
        status: savedMessage.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to process incoming message",
      error: error.message,
    });
  }
};

/**
 * List all active conversations for the authenticated HR
 */
export const listConversations = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const hrId = req.user?.key_id || 1;

    const conversations = await chatRepository.listConversationsByHr(hrId, organisation);

    return res.status(200).json({
      status: true,
      message: "Conversations fetched successfully",
      data: conversations,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

/**
 * Get message history for a conversation
 */
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const organisation = req.params.organisation;

    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        status: false,
        message: "Conversation not found",
      });
    }

    if (organisation && organisation !== "all" && conversation.organisation && conversation.organisation.toLowerCase() !== organisation.toLowerCase()) {
      return res.status(404).json({
        status: false,
        message: "Conversation not found in this organisation",
      });
    }

    const messages = await chatRepository.listMessages(conversationId);

    // Automatically mark unread messages as read by HR
    await chatRepository.markMessagesRead(conversationId, "hr");

    return res.status(200).json({
      status: true,
      message: "Messages fetched successfully",
      data: {
        conversation,
        messages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch conversation messages",
      error: error.message,
    });
  }
};

/**
 * Sync/check for new messages from external app API
 */
export const syncNewMessages = async (req, res) => {
  try {
    const hrId = req.user?.key_id || 1;
    const { user_id, conversation_id, since } = req.body;

    // Call external app API to pull any new messages
    const externalResult = await externalChatService.fetchNewMessagesFromExternalApp({
      hr_id: hrId,
      user_id,
      conversation_id,
      since,
    });

    let importedCount = 0;
    const importedMessages = [];

    if (externalResult.success && Array.isArray(externalResult.messages)) {
      for (const extMsg of externalResult.messages) {
        // Enforce rule: only import if conversation was initiated by HR
        const conversation = await chatRepository.findActiveConversationForUser({
          conversation_id: extMsg.conversation_id || conversation_id,
          hr_id: hrId,
          user_id: extMsg.sender_id || user_id,
        });

        if (conversation && conversation.is_hr_initiated) {
          const saved = await chatRepository.createMessage({
            conversation_id: conversation.conversation_id,
            sender_type: "user",
            sender_id: extMsg.sender_id || user_id,
            sender_name: extMsg.sender_name || conversation.user_name,
            receiver_type: "hr",
            receiver_id: hrId,
            message: extMsg.message,
            attachments: extMsg.attachments || [],
            status: "delivered",
            sync_status: "synced",
            external_message_id: extMsg.message_id || null,
          });
          importedCount++;
          importedMessages.push(saved);
        }
      }
    }

    return res.status(200).json({
      status: true,
      message: `Message sync completed. ${importedCount} new messages imported into MongoDB.`,
      data: {
        importedCount,
        importedMessages,
        syncResponse: externalResult,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to sync messages with external app",
      error: error.message,
    });
  }
};

/**
 * Mark messages in a conversation as read by HR
 */
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await chatRepository.markMessagesRead(conversationId, "hr");

    return res.status(200).json({
      status: true,
      message: "Conversation messages marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};
