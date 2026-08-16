import Leave from "../models/leaveModel.js";

class LeaveRepository {
  async create(leaveData) {
    const leave = new Leave(leaveData);
    return await leave.save();
  }

  async findByOrganisation(organisation, filter = {}) {
    return await Leave.find({ organisation, ...filter }).sort({ createdAt: -1 });
  }

  async findByEmployee(employeeId, organisation) {
    return await Leave.find({ employeeId, organisation }).sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Leave.findById(id);
  }

  async updateStatus(id, status, approvedBy = null) {
    return await Leave.findByIdAndUpdate(
      id,
      { status, approvedBy },
      { new: true }
    );
  }
}

export default new LeaveRepository();
