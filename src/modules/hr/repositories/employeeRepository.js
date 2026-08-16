import Employee from "../models/employeeModel.js";

class EmployeeRepository {
  async findAll(filter = {}) {
    return await Employee.find(filter).sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Employee.findById(id);
  }

  async findByCode(employeeCode) {
    return await Employee.findOne({ employeeCode });
  }

  async create(employeeData) {
    const employee = new Employee(employeeData);
    return await employee.save();
  }

  async update(id, updateData) {
    return await Employee.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await Employee.findByIdAndDelete(id);
  }
}

export default new EmployeeRepository();
