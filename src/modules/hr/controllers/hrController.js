import employeeRepository from "../repositories/employeeRepository.js";
import { employeeResource, employeeListResource } from "../resources/employeeResource.js";
import Employee from "../models/employeeModel.js";

/**
 * List employees for organisation passed in URL path
 */
export const listEmployees = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const filter = { organisation };

    if (req.body.keyword) {
      filter.$or = [
        { name: { $regex: req.body.keyword, $options: "i" } },
        { email: { $regex: req.body.keyword, $options: "i" } },
        { phone: { $regex: req.body.keyword, $options: "i" } },
        { employeeCode: { $regex: req.body.keyword, $options: "i" } },
        { designation: { $regex: req.body.keyword, $options: "i" } },
      ];
    }

    if (req.body.department && req.body.department !== "All") {
      filter.department = req.body.department;
    }

    if (req.body.status) {
      filter.status = req.body.status;
    }

    const employees = await employeeRepository.findAll(filter);
    return res.status(200).json({
      status: true,
      message: `Employees retrieved successfully for organisation: ${organisation}`,
      data: {
        employees: employeeListResource(employees),
        totalCount: employees.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

/**
 * Organizational Hierarchy Tree Handler (Image 4 support)
 */
export const getOrgTree = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { department } = req.body;

    const filter = { organisation };
    if (department && department !== "All") {
      filter.department = department;
    }

    const employees = await Employee.find(filter).lean();

    const empMap = new Map();
    employees.forEach((emp) => {
      const initials = emp.name
        ? emp.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
        : "AS";

      empMap.set(emp._id.toString(), {
        id: emp._id.toString(),
        name: emp.name,
        designation: emp.designation,
        department: emp.department,
        initials,
        avatar: emp.avatar || null,
        reportsTo: emp.reportsTo ? emp.reportsTo.toString() : null,
        children: [],
      });
    });

    const tree = [];
    empMap.forEach((node) => {
      if (node.reportsTo && empMap.has(node.reportsTo)) {
        empMap.get(node.reportsTo).children.push(node);
      } else {
        tree.push(node);
      }
    });

    return res.status(200).json({
      status: true,
      message: "Organizational hierarchy tree fetched successfully",
      data: tree,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch org tree",
      error: error.message,
    });
  }
};

/**
 * Add new employee under organisation passed in URL path
 */
export const addEmployee = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { name, email, phone, employeeCode, department, designation, salary, status, reportsTo, workplaceType, avatar, password } = req.body;

    if (!name) {
      return res.status(422).json({
        status: false,
        message: "Employee name is required",
      });
    }

    const code = employeeCode || `EMP-${Math.floor(100000 + Math.random() * 900000)}`;

    const newEmployee = await employeeRepository.create({
      employeeCode: code,
      name,
      email: email || null,
      phone: phone || null,
      organisation,
      department: department || "General",
      designation: designation || "Employee",
      salary: salary || 0,
      status: status || "active",
      reportsTo: reportsTo || null,
      workplaceType: workplaceType || "On-Site",
      avatar: avatar || null,
      ...(password && { password }),
    });

    return res.status(201).json({
      status: true,
      message: "Employee added successfully",
      data: employeeResource(newEmployee),
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to add employee",
      error: error.message,
    });
  }
};

/**
 * Get employee details by ID
 */
export const getEmployee = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const id = req.body.id || req.params.id;

    if (!id) {
      return res.status(422).json({
        status: false,
        message: "Employee ID is required",
      });
    }

    const employee = await employeeRepository.findById(id);
    if (!employee || employee.organisation !== organisation) {
      return res.status(404).json({
        status: false,
        message: "Employee not found in this organisation",
      });
    }

    return res.status(200).json({
      status: true,
      data: employeeResource(employee),
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
};

/**
 * Update employee details
 */
export const updateEmployee = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const id = req.body.id || req.params.id;

    if (!id) {
      return res.status(422).json({
        status: false,
        message: "Employee ID is required",
      });
    }

    const existing = await employeeRepository.findById(id);
    if (!existing || existing.organisation !== organisation) {
      return res.status(404).json({
        status: false,
        message: "Employee not found in this organisation",
      });
    }

    const updated = await employeeRepository.update(id, {
      ...req.body,
      organisation,
    });

    return res.status(200).json({
      status: true,
      message: "Employee updated successfully",
      data: employeeResource(updated),
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to update employee",
      error: error.message,
    });
  }
};

/**
 * Delete employee
 */
export const deleteEmployee = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const id = req.body.id || req.params.id;

    if (!id) {
      return res.status(422).json({
        status: false,
        message: "Employee ID is required",
      });
    }

    const existing = await employeeRepository.findById(id);
    if (!existing || existing.organisation !== organisation) {
      return res.status(404).json({
        status: false,
        message: "Employee not found in this organisation",
      });
    }

    await employeeRepository.delete(id);

    return res.status(200).json({
      status: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to delete employee",
      error: error.message,
    });
  }
};
