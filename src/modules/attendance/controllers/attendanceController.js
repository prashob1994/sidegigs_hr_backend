import attendanceRepository from "../repositories/attendanceRepository.js";
import Employee from "../../hr/models/employeeModel.js";
import Leave from "../../leave/models/leaveModel.js";

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

/**
 * Clock In Endpoint (Accepts shift location & tasks notes)
 */
export const clockIn = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { employeeId, employeeName, locationType, shiftNotes } = req.body;
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
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
    const attStatus = isLate ? "Late" : "Present";

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

      const updatedRecord = await attendanceRepository.addClockInLog(
        record._id,
        now,
        { type: "clock_in", timestamp: now }
      );

      if (locationType) updatedRecord.locationType = locationType;
      if (shiftNotes) updatedRecord.shiftNotes = shiftNotes;
      await updatedRecord.save();

      return res.status(200).json({
        status: true,
        message: "Employee clocked in successfully",
        data: updatedRecord,
      });
    }

    const newRecord = await attendanceRepository.create({
      employeeId: empId,
      employeeName: employeeName || employee.name,
      organisation,
      date: todayDate,
      clockInTime: now,
      locationType: locationType || "Office HQ",
      shiftNotes: shiftNotes || null,
      attendanceStatus: attStatus,
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
    const totalMinutes = Math.floor(timeDiffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const totalHoursText = `${hours}h ${mins}m`;
    const hoursWorked = Number((timeDiffMs / (1000 * 60 * 60)).toFixed(2));
    const newTotalHours = Number((record.totalHours + hoursWorked).toFixed(2));

    record.totalHoursText = totalHoursText;

    const updatedRecord = await attendanceRepository.updateClockOut(
      record._id,
      now,
      newTotalHours,
      { type: "clock_out", timestamp: now }
    );

    updatedRecord.totalHoursText = totalHoursText;
    await updatedRecord.save();

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
        locationType: record?.locationType || "Office HQ",
        shiftNotes: record?.shiftNotes || null,
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
 * Get All Employees Attendance History (HR Roster Screen - Image 3)
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

    const employeeIds = history.map((h) => h.employeeId).filter(Boolean);
    const employees = await Employee.find({ _id: { $in: employeeIds } });
    const empMap = new Map(employees.map((e) => [e._id.toString(), e]));

    const formattedHistory = history.map((rec) => {
      const emp = empMap.get(rec.employeeId?.toString());
      const initials = rec.employeeName
        ? rec.employeeName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
        : "AS";

      const clockInStr = rec.clockInTime
        ? new Date(rec.clockInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
        : "--:--";
      const clockOutStr = rec.clockOutTime
        ? new Date(rec.clockOutTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
        : "Pending";

      return {
        id: rec._id,
        employeeName: rec.employeeName,
        initials,
        department: emp?.department || "Engineering",
        dateFormatted: `Today, ${new Date(rec.clockInTime || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
        status: rec.attendanceStatus || (rec.status === "clocked_in" ? "Present" : "Late"),
        clockInTime: clockInStr,
        clockOutTime: clockOutStr,
        clockInOutText: `${clockInStr} - ${clockOutStr}`,
        location: rec.locationType || "Office HQ",
        totalHours: rec.totalHoursText || `${rec.totalHours || 0}h 00m`,
        shiftNotes: rec.shiftNotes || "Shift completed",
      };
    });

    return res.status(200).json({
      status: true,
      message: `Attendance history for organisation: ${organisation}`,
      data: {
        totalRecords: formattedHistory.length,
        history: formattedHistory,
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
 * Get Daily Attendance Summary Report Card (Image 1)
 */
export const getDailyReport = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const targetDate = req.body.date || getTodayDateString();

    const allEmployees = await Employee.find({ organisation, status: "active" });
    const attendanceRecords = await attendanceRepository.getDailyAttendance(
      targetDate,
      organisation
    );
    const approvedLeaves = await Leave.find({
      organisation,
      status: "approved",
      startDate: { $lte: new Date(targetDate) },
      endDate: { $gte: new Date(targetDate) },
    });

    const presentCount = attendanceRecords.filter((r) => r.attendanceStatus === "Present" || r.status === "clocked_in").length;
    const lateCount = attendanceRecords.filter((r) => r.attendanceStatus === "Late").length;
    const onLeaveCount = approvedLeaves.length;
    const totalAccounted = attendanceRecords.length + onLeaveCount;
    const absentCount = Math.max(0, allEmployees.length - totalAccounted);
    const totalStaff = allEmployees.length;

    const rate = totalStaff > 0 ? Number(((presentCount / totalStaff) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      status: true,
      message: `Daily attendance report for ${targetDate}`,
      data: {
        date: targetDate,
        presentCount,
        absentCount,
        lateCount,
        onLeaveCount,
        totalStaff,
        attendanceRate: rate,
        attendanceRateFormatted: `${rate}%`,
        summaryText: `Attendance Rate (${presentCount} / ${totalStaff} total)`,
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

/**
 * Export Attendance Roster as CSV (Image 3)
 */
export const exportCsv = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { startDate, endDate, status } = req.body;

    const history = await attendanceRepository.getAllEmployeesHistory(
      organisation,
      startDate,
      endDate,
      null,
      status
    );

    let csv = "Employee Name,Department,Date,Clock In,Clock Out,Location,Total Hours,Status,Shift Notes\n";

    history.forEach((rec) => {
      const clockIn = rec.clockInTime ? new Date(rec.clockInTime).toISOString() : "";
      const clockOut = rec.clockOutTime ? new Date(rec.clockOutTime).toISOString() : "";
      const notes = (rec.shiftNotes || "").replace(/,/g, ";");
      csv += `"${rec.employeeName}","${rec.organisation}","${rec.date}","${clockIn}","${clockOut}","${rec.locationType || "Office HQ"}","${rec.totalHoursText || ""}","${rec.attendanceStatus || "Present"}","${notes}"\n`;
    });

    return res.status(200).json({
      status: true,
      message: "Attendance CSV exported successfully",
      data: {
        filename: `attendance_report_${organisation}_${Date.now()}.csv`,
        csvData: csv,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to export attendance CSV",
      error: error.message,
    });
  }
};
