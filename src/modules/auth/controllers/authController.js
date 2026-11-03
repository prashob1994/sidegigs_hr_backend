import jwt from "jsonwebtoken";
import userRepository from "../repositories/userRepository.js";
import { hashPassword, comparePassword } from "../../../utils/bcryptPassword.js";
import generateToken from "../../../utils/generateToken.js";
import { userResource } from "../resources/userResource.js";
import { employeeResource } from "../../hr/resources/employeeResource.js";
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

    const cleanEmail = email.toLowerCase().trim();
    let user = await userRepository.findByEmail(cleanEmail);
    let employee = null;

    if (!user) {
      employee = await Employee.findOne({ email: cleanEmail });
      if (!employee) {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password",
        });
      }
    }

    // If logging in as an employee / worker
    if (employee) {
      if (employee.status === "inactive" || employee.status === "terminated") {
        return res.status(403).json({
          status: false,
          message: "Your employee account has been deactivated or terminated. Please contact your administrator.",
        });
      }

      if (!employee.password) {
        return res.status(401).json({
          status: false,
          message: "No password configured for this employee account. Please contact your administrator.",
        });
      }

      let isMatch = false;
      if (employee.password.startsWith("$2a$") || employee.password.startsWith("$2b$")) {
        isMatch = await comparePassword(password, employee.password);
      } else {
        isMatch = (password === employee.password);
        if (isMatch) {
          employee.password = await hashPassword(password);
          await employee.save();
        }
      }

      if (!isMatch) {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password",
        });
      }

      const token = generateToken(employee._id);
      const formattedEmployee = employeeResource(employee);
      const selectedOrg = organisation || formattedEmployee.organisation || "sidegigs";

      return res.status(200).json({
        status: true,
        message: "Login successful",
        data: {
          user: formattedEmployee,
          employee: formattedEmployee,
          organisation: selectedOrg,
          token,
          user_type: "worker",
          userType: "worker",
        },
      });
    }

    // Owner / HR Admin Login
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
        user_type: "owner",
        userType: "owner",
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
      is_verified: req.body.is_verified !== undefined ? Boolean(req.body.is_verified) : (req.body.is_verifed !== undefined ? Boolean(req.body.is_verifed) : false),
      verified_detail: req.body.verified_detail !== undefined ? req.body.verified_detail : null,
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

/**
 * Update HR user verification status and detail
 * Sets is_verified and verified_detail (can store text or JSON)
 */
export const updateVerification = async (req, res) => {
  try {
    const {
      id,
      userId,
      user_id,
      email,
      verified_detail,
      verifiedDetail,
    } = req.body;

    // Decode bearer token if not already decoded by middleware
    if (!req.user && req.headers?.authorization?.startsWith("Bearer ")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const secret = process.env.JWT_SECRET || "sidgigs_hr_jwt_secret_key_change_in_production";
        const decoded = jwt.verify(token, secret);
        if (decoded) req.user = decoded;
      } catch {
        // Fall back to body identifiers
      }
    }

    // Support both spellings: is_verified and is_verifed (per user prompt)
    const rawVerified =
      req.body.is_verified !== undefined
        ? req.body.is_verified
        : req.body.is_verifed;

    let is_verified = false;
    if (typeof rawVerified === "boolean") {
      is_verified = rawVerified;
    } else if (typeof rawVerified === "string") {
      is_verified = rawVerified.toLowerCase() === "true" || rawVerified === "1";
    } else if (typeof rawVerified === "number") {
      is_verified = rawVerified === 1;
    } else if (rawVerified === undefined) {
      is_verified = true;
    }

    // Support text or JSON in verified_detail
    let detail = verified_detail !== undefined ? verified_detail : verifiedDetail;
    if (typeof detail === "string") {
      const trimmed = detail.trim();
      if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        try {
          detail = JSON.parse(trimmed);
        } catch {
          // Keep as text string if parsing fails
        }
      }
    }

    // Target user identification
    const targetId = id || userId || user_id || req.user?.userId || req.user?.id || req.user?._id;
    const targetEmail = email ? email.toLowerCase().trim() : (req.user?.email ? req.user.email.toLowerCase().trim() : null);

    let user = null;
    if (targetId) {
      user = await User.findById(targetId);
    }
    if (!user && targetEmail) {
      user = await User.findOne({ email: targetEmail });
    }

    // Fallback: If not found in User collection, check Employee as fallback
    if (!user) {
      let employee = null;
      if (targetId) {
        employee = await Employee.findById(targetId);
      }
      if (!employee && targetEmail) {
        employee = await Employee.findOne({ email: targetEmail });
      }

      if (employee) {
        employee.is_verified = is_verified;
        if (detail !== undefined) {
          employee.verified_detail = detail;
        }
        await employee.save();

        return res.status(200).json({
          status: true,
          message: "Employee verification status updated successfully",
          data: {
            id: employee._id,
            email: employee.email,
            is_verified: employee.is_verified,
            verified_detail: employee.verified_detail,
            user_type: "worker",
            employee: employeeResource(employee),
          },
        });
      }

      return res.status(404).json({
        status: false,
        message: "User not found. Please provide a valid user ID, email, or Bearer token.",
      });
    }

    // Update User
    user.is_verified = is_verified;
    if (detail !== undefined) {
      user.verified_detail = detail;
    }
    await user.save();

    return res.status(200).json({
      status: true,
      message: "HR user verification status updated successfully",
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        is_verified: user.is_verified,
        verified_detail: user.verified_detail,
        user_type: "owner",
        user: userResource(user),
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to update verification status",
      error: error.message,
    });
  }
};
