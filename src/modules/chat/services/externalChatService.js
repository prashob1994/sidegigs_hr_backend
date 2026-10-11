import axios from "axios";

const getChatBaseUrl = () => {
  if (process.env.SIDEGIGS_CHAT_API_URL) {
    return process.env.SIDEGIGS_CHAT_API_URL;
  }
  const mainApi = process.env.SIDEGIGS_API_URL || "https://api.sidegigs.app/api";
  return `${mainApi}/chat`;
};

class ExternalChatService {
  /**
   * Forward message sent by HR to the external app API
   * @param {Object} payload
   */
  async forwardMessageToExternalApp(payload) {
    const url = `${getChatBaseUrl()}/receive`;
    try {
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          ...(process.env.CHAT_WEBHOOK_SECRET && {
            "X-Chat-Webhook-Secret": process.env.CHAT_WEBHOOK_SECRET,
          }),
        },
        timeout: 5000,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.warn(`[ExternalChatService] Failed to forward message to external app: ${error.message}`);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status || 500,
      };
    }
  }

  /**
   * Fetch new/unread messages from external app API to check for updates
   * @param {Object} params - { hr_id, user_id, conversation_id, since }
   */
  async fetchNewMessagesFromExternalApp(params = {}) {
    const url = `${getChatBaseUrl()}/sync`;
    try {
      const response = await axios.get(url, {
        params,
        headers: {
          "Content-Type": "application/json",
          ...(process.env.CHAT_WEBHOOK_SECRET && {
            "X-Chat-Webhook-Secret": process.env.CHAT_WEBHOOK_SECRET,
          }),
        },
        timeout: 5000,
      });

      return {
        success: true,
        messages: response.data?.data?.messages || response.data?.messages || [],
      };
    } catch (error) {
      console.warn(`[ExternalChatService] Failed to sync messages from external app: ${error.message}`);
      return {
        success: false,
        messages: [],
        error: error.response?.data?.message || error.message,
      };
    }
  }
}

export default new ExternalChatService();
