import leaveRepository from "../repositories/leaveRepository.js";
import Employee from "../../hr/models/employeeModel.js";

/**
 * Helper to calculate relative time string (e.g., "Applied 2 hours ago")
 */
const getAppliedAgoText = (createdAt) => {
  if (!createdAt) return "Applied recently";
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Applied just now";
  if (diffHours < 24) return `Applied ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Applied Yesterday";
  return `Applied ${diffDays} days ago`;
};

/**
 * Apply for leave under specified organisation
 */
export const applyLeave = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { employeeId, employeeName, leaveType, leaveTitle, startDate, endDate, reason, urgency } = req.body;

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
      leaveTitle: leaveTitle || (leaveType ? `${leaveType.charAt(0).toUpperCase() + leaveType.slice(1)} Leave` : "Casual Leave"),
      startDate: start,
      endDate: end,
      totalDays: totalDays || 1,
      reason,
      urgency: urgency || false,
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
 * Formatted Time-Off Request Cards for Mobile Approvals Screen
 */
export const getApprovalsList = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { status = "pending" } = req.body;

    const filter = {};
    if (status && status !== "all") {
      filter.status = status.toLowerCase();
    }

    const leaves = await leaveRepository.findByOrganisation(organisation, filter);
    const employeeIds = leaves.map((l) => l.employeeId).filter(Boolean);
    const employees = await Employee.find({ _id: { $in: employeeIds } });
    const empMap = new Map(employees.map((e) => [e._id.toString(), e]));

    const formattedCards = leaves.map((leave) => {
      const emp = empMap.get(leave.employeeId?.toString());
      const initials = leave.employeeName
        ? leave.employeeName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
        : "AS";

      const startStr = new Date(leave.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      const endStr = new Date(leave.endDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

      return {
        id: leave._id,
        employeeName: leave.employeeName,
        initials,
        department: emp?.department || "Engineering",
        appliedAgo: getAppliedAgoText(leave.createdAt),
        status: (leave.status || "pending").toUpperCase(),
        leaveTitle: leave.leaveTitle || "Leave Application",
        dateRange: `${startStr} to ${endStr}`,
        totalDays: `${leave.totalDays || 1} Day(s)`,
        reason: leave.reason,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Time-off approval cards fetched successfully",
      data: {
        pendingCount: formattedCards.filter((c) => c.status === "PENDING").length,
        totalCards: formattedCards.length,
        requests: formattedCards,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch approvals list",
      error: error.message,
    });
  }
};

/**
 * Approve leave application
 */
export const approveLeave = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { id } = req.body;

    const leave = await leaveRepository.findById(id);
    if (!leave || leave.organisation !== organisation) {
      return res.status(404).json({
        status: false,
        message: "Leave application not found in this organisation",
      });
    }

    const updated = await leaveRepository.updateStatus(
      id,
      "approved",
      req.user?.name || req.user?.email || "HR Admin"
    );

    return res.status(200).json({
      status: true,
      message: "Leave application approved successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to approve leave application",
      error: error.message,
    });
  }
};

/**
 * Reject leave application
 */
export const rejectLeave = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { id, rejectionReason } = req.body;

    const leave = await leaveRepository.findById(id);
    if (!leave || leave.organisation !== organisation) {
      return res.status(404).json({
        status: false,
        message: "Leave application not found in this organisation",
      });
    }

    if (rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    const updated = await leaveRepository.updateStatus(
      id,
      "rejected",
      req.user?.name || req.user?.email || "HR Admin"
    );

    return res.status(200).json({
      status: true,
      message: "Leave application rejected successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to reject leave application",
      error: error.message,
    });
  }
};

/**
 * Change leave status (approve/reject legacy endpoint)
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
