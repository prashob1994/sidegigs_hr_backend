import Employee from "../../../hr/models/employeeModel.js";
import { comparePassword, hashPassword } from "../../../../utils/bcryptPassword.js";
import generateToken from "../../../../utils/generateToken.js";
import { employeeResource } from "../../../hr/resources/employeeResource.js";

/**
 * Employee Login endpoint accepting username and password parameters
 */
export const employeeLogin = async (req, res) => {
  try {
    const { username, email, employeeCode, password, organisation: bodyOrganisation } = req.body;
    const loginUser = username || email || employeeCode;

    if (!loginUser || !password) {
      return res.status(422).json({
        status: false,
        message: "Both username and password are required",
        errors: {
          ...(!loginUser && { username: "username parameter is required" }),
          ...(!password && { password: "password parameter is required" }),
        },
      });
    }

    const orgParam = req.params.organisation || bodyOrganisation;

    // Search query matching username against email or employeeCode
    const query = {
      $or: [
        { email: loginUser.toLowerCase() },
        { employeeCode: loginUser },
      ],
    };

    if (orgParam && orgParam !== "all") {
      query.organisation = new RegExp(`^${orgParam}$`, "i");
    }

    const employee = await Employee.findOne(query);
    if (!employee) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials or employee not found",
      });
    }

    // Disallow login for inactive/terminated employees
    if (employee.status === "inactive" || employee.status === "terminated") {
      return res.status(403).json({
        status: false,
        message: "Your employee account has been deactivated or terminated. Please contact your administrator.",
      });
    }

    // Require password to be configured
    if (!employee.password) {
      return res.status(401).json({
        status: false,
        message: "No password configured for this employee account. Please contact your administrator.",
      });
    }

    // Verify password (supports bcrypt hash and automatically upgrades legacy plain-text passwords)
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
        message: "Invalid credentials",
      });
    }

    const token = generateToken(employee._id);
    const formattedEmployee = employeeResource(employee);

    return res.status(200).json({
      status: true,
      message: "Employee login successful",
      data: {
        employee: formattedEmployee,
        organisation: formattedEmployee.organisation || "sidegigs",
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Employee login failed",
      error: error.message,
    });
  }
};

/**
 * Change or set employee password
 */
export const changeEmployeePassword = async (req, res) => {
  try {
    const { username, email, employeeCode, currentPassword, newPassword } = req.body;
    const loginUser = username || email || employeeCode || req.user?.email || req.user?.employeeCode;

    if (!loginUser) {
      return res.status(422).json({
        status: false,
        message: "Employee username, email, or employeeCode is required",
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(422).json({
        status: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const employee = await Employee.findOne({
      $or: [
        { email: String(loginUser).toLowerCase() },
        { employeeCode: String(loginUser) },
      ],
    });

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    // If current password exists on account, verify it first (unless admin is resetting)
    if (employee.password && currentPassword) {
      let isMatch = false;
      if (employee.password.startsWith("$2a$") || employee.password.startsWith("$2b$")) {
        isMatch = await comparePassword(currentPassword, employee.password);
      } else {
        isMatch = (currentPassword === employee.password);
      }

      if (!isMatch) {
        return res.status(401).json({
          status: false,
          message: "Current password does not match",
        });
      }
    } else if (employee.password && !currentPassword && !req.user?.role) {
      return res.status(422).json({
        status: false,
        message: "Current password is required to change password",
      });
    }

    employee.password = await hashPassword(newPassword);
    await employee.save();

    return res.status(200).json({
      status: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to update password",
      error: error.message,
    });
  }
};
