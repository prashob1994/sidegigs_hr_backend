import userRepository from "../repositories/userRepository.js";
import { hashPassword, comparePassword } from "../../../utils/bcryptPassword.js";
import generateToken from "../../../utils/generateToken.js";
import { userResource } from "../resources/userResource.js";
import sidegigsAuthService from "../../../services/sidegigsAuthService.js";
import Employee from "../../hr/models/employeeModel.js";
import User from "../models/userModel.js";

/**
 * Public API: Pass email to list the organisation associated with that email
 */
export const getOrganisationByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(422).json({
        status: false,
        message: "Email parameter is required",
        errors: { email: "Please provide an email address" },
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Search in Employee collection
    const employee = await Employee.findOne({ email: cleanEmail });
    if (employee && employee.organisation) {
      return res.status(200).json({
        status: true,
        message: "Organisation retrieved successfully",
        data: {
          email: cleanEmail,
          organisation: employee.organisation,
          userType: "employee",
        },
      });
    }

    // 2. Search in User / HR collection
    const user = await User.findOne({ email: cleanEmail });
    if (user && user.organisation) {
      return res.status(200).json({
        status: true,
        message: "Organisation retrieved successfully",
        data: {
          email: cleanEmail,
          organisation: user.organisation,
          userType: user.role || "hr",
        },
      });
    }

    return res.status(404).json({
      status: false,
      message: "No organisation found for this email address",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to retrieve organisation",
      error: error.message,
    });
  }
};

/**
 * Step 1: Generate Email Token by asking user for email and calling external API:
 * https://api.sidegigs.app/api/admin/hr/generate-email-token
 */
export const generateEmailToken = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(422).json({
        status: false,
        message: "Email is required",
        errors: { email: "Please provide an email address" },
      });
    }

    const result = await sidegigsAuthService.generateEmailToken(email);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json(error.data || {
      status: false,
      message: "An error occurred while generating email token",
      error: error.message,
    });
  }
};

/**
 * Step 2: Verify Token & Password by passing emailToken and password to external API:
 * https://api.sidegigs.app/api/admin/hr/verify-token
 */
export const verifyToken = async (req, res) => {
  try {
    const { emailToken, password } = req.body;

    if (!emailToken || !password) {
      return res.status(422).json({
        status: false,
        message: "Both emailToken and password are required",
        errors: {
          ...(!emailToken && { emailToken: "emailToken is required" }),
          ...(!password && { password: "password is required" }),
        },
      });
    }

    const result = await sidegigsAuthService.verifyToken(emailToken, password);

    // Guarantee organisation is returned in the response data
    if (result && result.data) {
      const orgName = result.data.organisation || result.data.organisationName || "sidegigs";
      result.data.organisation = orgName;
      result.organisation = orgName;
    }

    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json(error.data || {
      status: false,
      message: "An error occurred while verifying token",
      error: error.message,
    });
  }
};

/**
 * Separate Direct Email & Password HR Login API (Returns organisation name)
 */
export const emailLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({
        status: false,
        message: "Both email and password are required",
      });
    }

    const user = await userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);
    const formattedUser = userResource(user);

    return res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        user: formattedUser,
        organisation: formattedUser.organisation,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Login failed",
      error: error.message,
    });
  }
};
