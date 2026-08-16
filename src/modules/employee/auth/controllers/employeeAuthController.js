import Employee from "../../../hr/models/employeeModel.js";
import { comparePassword } from "../../../../utils/bcryptPassword.js";
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

    if (orgParam) {
      query.organisation = orgParam;
    }

    const employee = await Employee.findOne(query);
    if (!employee) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials or employee not found",
      });
    }

    if (employee.password) {
      const isMatch = await comparePassword(password, employee.password);
      if (!isMatch) {
        return res.status(401).json({
          status: false,
          message: "Invalid credentials",
        });
      }
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
