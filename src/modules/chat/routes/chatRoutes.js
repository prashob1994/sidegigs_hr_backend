import express from "express";
import {
  sendMessage,
  receiveIncomingMessage,
  listConversations,
  getConversationMessages,
  syncNewMessages,
  markAsRead,
} from "../controllers/chatController.js";
import {
  validateSendMessage,
  validateIncomingMessage,
  validateSyncMessages,
} from "../requests/chatRequest.js";
import authenticateUser from "../../../middlewares/authenticateUser.js";

const chatRouter = express.Router({ mergeParams: true });

// ==========================================
// 1. External App Webhook Endpoints (Public)
// ==========================================

/**
 * @swagger
 * /api/chat/incoming:
 *   post:
 *     summary: Webhook for External App to deliver user message replies to HR
 *     description: External users can ONLY reply to an existing conversation previously initiated by an HR user. If no active HR conversation exists, returns 403 Forbidden.
 *     tags: [Inter-App Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sender_id, message]
 *             properties:
 *               sender_id:
 *                 type: number
 *                 description: External app user ID
 *                 example: 25
 *               hr_id:
 *                 type: number
 *                 description: Target HR Manager ID (optional if conversation_id provided)
 *                 example: 1
 *               conversation_id:
 *                 type: string
 *                 description: Conversation ID previously initiated by HR
 *                 example: "conv_1_25_1728666000000"
 *               message:
 *                 type: string
 *                 description: Reply message text
 *                 example: "Hello, thank you for reaching out! Yes, I am available for an interview tomorrow."
 *               sender_name:
 *                 type: string
 *                 example: "Alex Johnson"
 *               job_id:
 *                 type: number
 *                 example: 101
 *               external_message_id:
 *                 type: string
 *                 example: "ext_msg_987654"
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     file_type:
 *                       type: string
 *                     file_name:
 *                       type: string
 *     responses:
 *       200:
 *         description: Message received and saved to MongoDB
 *       403:
 *         description: Forbidden - External user can only reply to an active HR-initiated conversation
 *       422:
 *         description: Validation Error
 *
 * /api/chat/receive:
 *   post:
 *     summary: Webhook alias for External App to deliver user message replies to HR
 *     tags: [Inter-App Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sender_id, message]
 *             properties:
 *               sender_id:
 *                 type: number
 *                 example: 25
 *               hr_id:
 *                 type: number
 *                 example: 1
 *               conversation_id:
 *                 type: string
 *                 example: "conv_1_25_1728666000000"
 *               message:
 *                 type: string
 *                 example: "Hello, thank you for reaching out!"
 *     responses:
 *       200:
 *         description: Message received and saved to MongoDB
 *       403:
 *         description: Forbidden - External user can only reply to an active HR-initiated conversation
 */
chatRouter.post("/incoming", validateIncomingMessage, receiveIncomingMessage);
chatRouter.post("/receive", validateIncomingMessage, receiveIncomingMessage);

// ==========================================
// 2. Authenticated HR Chat Endpoints
// ==========================================

/**
 * @swagger
 * /api/{organisation}/chat/send:
 *   post:
 *     summary: HR initiates or sends a message to an external app user
 *     description: Stores message in MongoDB and forwards it to the external app API.
 *     tags: [Inter-App Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisation
 *         required: true
 *         schema:
 *           type: string
 *         example: "sidegigs"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, message]
 *             properties:
 *               user_id:
 *                 type: number
 *                 description: External app user ID to contact
 *                 example: 25
 *               message:
 *                 type: string
 *                 description: Text content
 *                 example: "Hi Alex, we reviewed your application for Lead Mobile Architect. Are you available for a brief call?"
 *               job_id:
 *                 type: number
 *                 description: Optional related Job ID
 *                 example: 101
 *               user_name:
 *                 type: string
 *                 example: "Alex Johnson"
 *               user_avatar:
 *                 type: string
 *                 example: "https://cdn.sidegigs.com/avatars/user25.jpg"
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     file_type:
 *                       type: string
 *                     file_name:
 *                       type: string
 *     responses:
 *       201:
 *         description: Message saved in MongoDB and forwarded to external app
 *       422:
 *         description: Validation Error
 */
chatRouter.post("/send", authenticateUser, validateSendMessage, sendMessage);

/**
 * @swagger
 * /api/{organisation}/chat/conversations:
 *   get:
 *     summary: List all active conversations for the authenticated HR
 *     tags: [Inter-App Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisation
 *         required: true
 *         schema:
 *           type: string
 *         example: "sidegigs"
 *     responses:
 *       200:
 *         description: List of conversations retrieved successfully from MongoDB
 */
chatRouter.get("/conversations", authenticateUser, listConversations);

/**
 * @swagger
 * /api/{organisation}/chat/messages/{conversationId}:
 *   get:
 *     summary: Retrieve message history for a conversation
 *     tags: [Inter-App Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisation
 *         required: true
 *         schema:
 *           type: string
 *         example: "sidegigs"
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "conv_1_25_1728666000000"
 *     responses:
 *       200:
 *         description: Conversation history fetched from MongoDB
 *       404:
 *         description: Conversation not found
 */
chatRouter.get("/messages/:conversationId", authenticateUser, getConversationMessages);

/**
 * @swagger
 * /api/{organisation}/chat/sync:
 *   post:
 *     summary: Check and sync new messages from external app API
 *     description: Calls external app's sync endpoint to pull any new replies and stores them in MongoDB.
 *     tags: [Inter-App Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisation
 *         required: true
 *         schema:
 *           type: string
 *         example: "sidegigs"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversation_id:
 *                 type: string
 *                 example: "conv_1_25_1728666000000"
 *               user_id:
 *                 type: number
 *                 example: 25
 *               since:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Synchronization completed successfully
 */
chatRouter.post("/sync", authenticateUser, validateSyncMessages, syncNewMessages);

/**
 * @swagger
 * /api/{organisation}/chat/read/{conversationId}:
 *   patch:
 *     summary: Mark messages in a conversation as read
 *     tags: [Inter-App Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisation
 *         required: true
 *         schema:
 *           type: string
 *         example: "sidegigs"
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "conv_1_25_1728666000000"
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
chatRouter.patch("/read/:conversationId", authenticateUser, markAsRead);

export default chatRouter;
