import Payslip from "../models/payslipModel.js";
import Employee from "../../hr/models/employeeModel.js";
import Claim from "../../claims/models/claimModel.js";

class PayrollRepository {
  async getSummary(organisation) {
    const activeEmployees = await Employee.find({ organisation, status: "active" });
    const staffCount = activeEmployees.length;

    const totalBudget = activeEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const totalBudgetFormatted = `₹${totalBudget.toLocaleString("en-IN")}`;

    const pendingClaims = await Claim.find({ organisation, status: "pending" });
    const pendingAmount = pendingClaims.reduce((sum, c) => sum + (c.amount || 0), 0);
    const pendingAmountFormatted = `₹${pendingAmount.toLocaleString("en-IN")}`;

    return {
      payrollBudgetFormatted: totalBudgetFormatted,
      payrollBudgetValue: totalBudget,
      disbursedStaffText: `${staffCount} Staff Disbursed`,
      pendingClaimsFormatted: pendingAmountFormatted,
      pendingClaimsReviewCount: pendingClaims.length,
      pendingClaimsReviewText: `${pendingClaims.length} Pending Review`,
    };
  }

  async findPayslipsByOrganisation(organisation, filter = {}) {
    return await Payslip.find({ organisation, ...filter }).sort({ createdAt: -1 });
  }

  async createPayslip(data) {
    return await Payslip.create(data);
  }

  async findPayslipById(id) {
    return await Payslip.findById(id);
  }
}

export default new PayrollRepository();
