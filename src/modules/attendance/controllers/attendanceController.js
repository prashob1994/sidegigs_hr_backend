import attendanceRepository from "../repositories/attendanceRepository.js";
import Employee from "../../hr/models/employeeModel.js";

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

/**
 * Clock In Endpoint
 */
export const clockIn = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { employeeId, employeeName } = req.body;
    const empId = employeeId || req.user?.userId;

    if (!empId) {
      return res.status(422).json({
        status: false,
        message: "employeeId is required",
      });
    }

    const employee = await Employee.findById(empId);
    if (!employee || employee.organisation !== organisation) {
      return res.status(404).json({
        status: false,
        message: "Employee not found in this organisation",
      });
    }

    const todayDate = getTodayDateString();
    const now = new Date();

    let record = await attendanceRepository.findByEmployeeAndDate(
      empId,
      todayDate,
      organisation
    );

    if (record) {
      if (record.status === "clocked_in") {
        return res.status(400).json({
          status: false,
          message: "Employee is already clocked in for today",
          data: record,
        });
      }

      // Re-clock in
      const updatedRecord = await attendanceRepository.addClockInLog(
        record._id,
        now,
        { type: "clock_in", timestamp: now }
      );

      return res.status(200).json({
        status: true,
        message: "Employee clocked in successfully",
        data: updatedRecord,
      });
    }

    // New Clock-In Record
    const newRecord = await attendanceRepository.create({
      employeeId: empId,
      employeeName: employeeName || employee.name,
      organisation,
      date: todayDate,
      clockInTime: now,
      status: "clocked_in",
      logs: [{ type: "clock_in", timestamp: now }],
    });

    return res.status(201).json({
      status: true,
      message: "Employee clocked in successfully",
      data: newRecord,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Clock-in failed",
      error: error.message,
    });
  }
};

/**
 * Clock Out Endpoint
 */
export const clockOut = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { employeeId } = req.body;
    const empId = employeeId || req.user?.userId;

    if (!empId) {
      return res.status(422).json({
        status: false,
        message: "employeeId is required",
      });
    }

    const todayDate = getTodayDateString();
    const record = await attendanceRepository.findByEmployeeAndDate(
      empId,
      todayDate,
      organisation
    );

    if (!record || record.status === "clocked_out") {
      return res.status(400).json({
        status: false,
        message: "Employee is not currently clocked in",
      });
    }

    const now = new Date();
    const timeDiffMs = now.getTime() - new Date(record.clockInTime).getTime();
    const hoursWorked = Number((timeDiffMs / (1000 * 60 * 60)).toFixed(2));
    const newTotalHours = Number((record.totalHours + hoursWorked).toFixed(2));

    const updatedRecord = await attendanceRepository.updateClockOut(
      record._id,
      now,
      newTotalHours,
      { type: "clock_out", timestamp: now }
    );

    return res.status(200).json({
      status: true,
      message: "Employee clocked out successfully",
      data: updatedRecord,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Clock-out failed",
      error: error.message,
    });
  }
};

/**
 * Get Employee Clock Status for Today
 */
export const getStatus = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { employeeId } = req.body;
    const empId = employeeId || req.user?.userId;

    if (!empId) {
      return res.status(422).json({
        status: false,
        message: "employeeId is required",
      });
    }

    const todayDate = getTodayDateString();
    const record = await attendanceRepository.findByEmployeeAndDate(
      empId,
      todayDate,
      organisation
    );

    return res.status(200).json({
      status: true,
      data: {
        date: todayDate,
        isClockedIn: record ? record.status === "clocked_in" : false,
        record: record || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch clock status",
      error: error.message,
    });
  }
};

/**
 * Get Attendance History for Single Employee
 */
export const getHistory = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { employeeId, startDate, endDate } = req.body;
    const empId = employeeId || req.user?.userId;

    if (!empId) {
      return res.status(422).json({
        status: false,
        message: "employeeId is required",
      });
    }

    const history = await attendanceRepository.getEmployeeHistory(
      empId,
      organisation,
      startDate,
      endDate
    );

    return res.status(200).json({
      status: true,
      data: {
        employeeId: empId,
        organisation,
        totalRecords: history.length,
        history,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch attendance history",
      error: error.message,
    });
  }
};

/**
 * Get All Employees Attendance History (HR Endpoint)
 * Filterable by startDate, endDate, keyword (employee name), and status
 */
export const getAllEmployeesHistory = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { startDate, endDate, keyword, status } = req.body;

    const history = await attendanceRepository.getAllEmployeesHistory(
      organisation,
      startDate,
      endDate,
      keyword,
      status
    );

    return res.status(200).json({
      status: true,
      message: `Attendance history for all employees in organisation: ${organisation}`,
      data: {
        organisation,
        totalRecords: history.length,
        history,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch all employees attendance history",
      error: error.message,
    });
  }
};

/**
 * Get Daily Attendance Summary Report (Clocked In vs Not Clocked In/Absent)
 */
export const getDailyReport = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const targetDate = req.body.date || getTodayDateString();

    // 1. Fetch all active employees for this organisation
    const allEmployees = await Employee.find({ organisation, status: "active" });

    // 2. Fetch attendance records for the target date
    const attendanceRecords = await attendanceRepository.getDailyAttendance(
      targetDate,
      organisation
    );

    const clockedInEmpIds = new Set(
      attendanceRecords.map((rec) => rec.employeeId.toString())
    );

    // 3. Separate Clocked-In vs Not Clocked In
    const clockedInEmployees = attendanceRecords.map((rec) => ({
      employeeId: rec.employeeId,
      employeeName: rec.employeeName,
      clockInTime: rec.clockInTime,
      clockOutTime: rec.clockOutTime,
      status: rec.status,
      totalHours: rec.totalHours,
    }));

    const notClockedInEmployees = allEmployees
      .filter((emp) => !clockedInEmpIds.has(emp._id.toString()))
      .map((emp) => ({
        employeeId: emp._id,
        employeeName: emp.name,
        email: emp.email,
        phone: emp.phone,
        department: emp.department,
        designation: emp.designation,
      }));

    return res.status(200).json({
      status: true,
      message: `Attendance report for ${targetDate} (${organisation})`,
      data: {
        date: targetDate,
        organisation,
        totalEmployees: allEmployees.length,
        clockedInCount: clockedInEmployees.length,
        notClockedInCount: notClockedInEmployees.length,
        clockedInEmployees,
        notClockedInEmployees,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to generate daily attendance report",
      error: error.message,
    });
  }
};
