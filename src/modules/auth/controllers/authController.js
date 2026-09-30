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

    // 1. Search in User (userSchema) collection first
    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      const org = user.organisation || user.business_name || "sidegigs";
      return res.status(200).json({
        status: true,
        message: "Organisation retrieved successfully",
        data: {
          email: cleanEmail,
          organisation: org,
          user_type: "owner",
          userType: "owner",
        },
      });
    }

    // 2. If not present in userSchema, search in Employee collection
    const employee = await Employee.findOne({ email: cleanEmail });
    if (employee && employee.organisation) {
      return res.status(200).json({
        status: true,
        message: "Organisation retrieved successfully",
        data: {
          email: cleanEmail,
          organisation: employee.organisation,
          user_type: "worker",
          userType: "worker",
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
    const { email, password, organisation } = req.body;

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
    const selectedOrg = organisation || formattedUser.organisation || "sidegigs";

    return res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        user: formattedUser,
        organisation: selectedOrg,
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

/**
 * Create HR User API (Registration with preferences, business info, location, and phone)
 */
export const createHrUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone_number,
      is_company,
      is_individual,
      business_name,
      business_type,
      location_text,
      location,
      is_hire_works,
      is_manage_attendance,
      is_manage_jobs,
      is_find_temporary_works,
      organisation,
      role,
    } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(cleanEmail);
    if (existingUser) {
      return res.status(409).json({
        status: false,
        message: "A user with this email address already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    let formattedLocation = { type: "Point", coordinates: [0, 0] };
    if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      formattedLocation = {
        type: location.type || "Point",
        coordinates: location.coordinates,
      };
    } else if (Array.isArray(location) && location.length === 2) {
      formattedLocation = {
        type: "Point",
        coordinates: location,
      };
    }

    const userData = {
      name,
      email: cleanEmail,
      password: hashedPassword,
      phone_number: phone_number || null,
      is_company: Boolean(is_company),
      is_individual: Boolean(is_individual),
      business_name: business_name || null,
      business_type: business_type || null,
      location_text: location_text || null,
      location: formattedLocation,
      is_hire_works: Boolean(is_hire_works),
      is_manage_attendance: Boolean(is_manage_attendance),
      is_manage_jobs: Boolean(is_manage_jobs),
      is_find_temporary_works: Boolean(is_find_temporary_works),
      organisation: organisation || business_name || "sidegigs",
      role: role || "hr",
      status: "active",
    };

    const newUser = await userRepository.create(userData);
    const token = generateToken(newUser._id);
    const formattedUser = userResource(newUser);

    return res.status(201).json({
      status: true,
      message: "HR user account created successfully",
      data: {
        user: formattedUser,
        organisation: formattedUser.organisation,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to create HR user",
      error: error.message,
    });
  }
};
