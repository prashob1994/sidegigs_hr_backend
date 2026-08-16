import leaveRepository from "../repositories/leaveRepository.js";
import Employee from "../../hr/models/employeeModel.js";

/**
 * Apply for leave under specified organisation
 */
export const applyLeave = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { employeeId, employeeName, leaveType, startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(422).json({
        status: false,
        message: "startDate, endDate, and reason are required",
      });
    }

    let empName = employeeName;
    let empId = employeeId;

    if (req.user?.userId) {
      empId = empId || req.user.userId;
      const emp = await Employee.findById(empId);
      if (emp) {
        empName = emp.name;
      }
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    const leave = await leaveRepository.create({
      employeeId: empId || "600000000000000000000000",
      employeeName: empName || "Employee",
      organisation,
      leaveType: leaveType || "casual",
      startDate: start,
      endDate: end,
      totalDays: totalDays || 1,
      reason,
      status: "pending",
    });

    return res.status(201).json({
      status: true,
      message: "Leave application submitted successfully",
      data: leave,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to apply for leave",
      error: error.message,
    });
  }
};

/**
 * List leaves applied by current employee
 */
export const myLeaves = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const employeeId = req.body.employeeId || req.user?.userId;

    if (!employeeId) {
      return res.status(422).json({
        status: false,
        message: "employeeId is required",
      });
    }

    const leaves = await leaveRepository.findByEmployee(employeeId, organisation);
    return res.status(200).json({
      status: true,
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch leaves",
      error: error.message,
    });
  }
};

/**
 * List all leave applications for specified organisation
 */
export const listLeaves = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const filter = {};

    if (req.body.status) {
      filter.status = req.body.status;
    }

    const leaves = await leaveRepository.findByOrganisation(organisation, filter);
    return res.status(200).json({
      status: true,
      message: `Leave applications for organisation: ${organisation}`,
      data: {
        leaves,
        totalCount: leaves.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch leave applications",
      error: error.message,
    });
  }
};

/**
 * Change leave status (approve/reject)
 */
export const changeLeaveStatus = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(422).json({
        status: false,
        message: "id and status (approved/rejected) are required",
      });
    }

    const leave = await leaveRepository.findById(id);
    if (!leave || leave.organisation !== organisation) {
      return res.status(404).json({
        status: false,
        message: "Leave application not found in this organisation",
      });
    }

    const updated = await leaveRepository.updateStatus(
      id,
      status,
      req.user?.name || req.user?.email || "HR Admin"
    );

    return res.status(200).json({
      status: true,
      message: `Leave application ${status} successfully`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to update leave status",
      error: error.message,
    });
  }
};
