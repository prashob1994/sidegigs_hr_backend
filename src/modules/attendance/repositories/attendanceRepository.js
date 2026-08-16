import Attendance from "../models/attendanceModel.js";

class AttendanceRepository {
  async findByEmployeeAndDate(employeeId, date, organisation) {
    return await Attendance.findOne({ employeeId, date, organisation });
  }

  async create(data) {
    const attendance = new Attendance(data);
    return await attendance.save();
  }

  async updateClockOut(id, clockOutTime, totalHours, newLog) {
    return await Attendance.findByIdAndUpdate(
      id,
      {
        clockOutTime,
        totalHours,
        status: "clocked_out",
        $push: { logs: newLog },
      },
      { new: true }
    );
  }

  async addClockInLog(id, clockInTime, newLog) {
    return await Attendance.findByIdAndUpdate(
      id,
      {
        clockInTime,
        status: "clocked_in",
        $push: { logs: newLog },
      },
      { new: true }
    );
  }

  async getEmployeeHistory(employeeId, organisation, startDate, endDate) {
    const query = { employeeId, organisation };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    }
    return await Attendance.find(query).sort({ date: -1 });
  }

  async getAllEmployeesHistory(organisation, startDate, endDate, keyword, status) {
    const query = { organisation };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    }
    if (status) {
      query.status = status;
    }
    if (keyword) {
      query.employeeName = { $regex: keyword, $options: "i" };
    }
    return await Attendance.find(query).sort({ date: -1, clockInTime: -1 });
  }

  async getDailyAttendance(date, organisation) {
    return await Attendance.find({ date, organisation });
  }
}

export default new AttendanceRepository();
