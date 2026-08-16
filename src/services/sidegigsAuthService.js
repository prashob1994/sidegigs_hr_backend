import axios from "axios";

const getBaseUrl = () => {
  return process.env.SIDEGIGS_API_URL || "https://api.sidegigs.app/api";
};

class SidegigsAuthService {
  /**
   * Delegates generate email token request to remote Sidegigs API
   * @param {string} email
   */
  async generateEmailToken(email) {
    const url = `${getBaseUrl()}/admin/hr/generate-email-token`;
    try {
      const response = await axios.post(
        url,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw {
          status: error.response.status,
          data: error.response.data,
        };
      }
      throw {
        status: 500,
        data: {
          status: false,
          message: "Failed to connect to authentication service",
          error: error.message,
        },
      };
    }
  }

  /**
   * Delegates token verification request to remote Sidegigs API
   * @param {string} emailToken
   * @param {string} password
   */
  async verifyToken(emailToken, password) {
    const url = `${getBaseUrl()}/admin/hr/verify-token`;
    try {
      const response = await axios.post(
        url,
        { emailToken, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw {
          status: error.response.status,
          data: error.response.data,
        };
      }
      throw {
        status: 500,
        data: {
          status: false,
          message: "Failed to connect to authentication service",
          error: error.message,
        },
      };
    }
  }
}

export default new SidegigsAuthService();
