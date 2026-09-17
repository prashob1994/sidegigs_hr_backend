import payrollRepository from "../repositories/payrollRepository.js";

/**
 * Payroll Budget & Pending Claims Summary
 */
export const getPayrollSummary = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const summary = await payrollRepository.getSummary(organisation);
    return res.status(200).json({
      status: true,
      message: "Payroll summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch payroll summary",
      error: error.message,
    });
  }
};

/**
 * List Monthly Payslips
 */
export const getMonthlyPayslips = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const filter = {};
    if (req.body.employeeId) filter.employeeId = req.body.employeeId;

    const payslips = await payrollRepository.findPayslipsByOrganisation(organisation, filter);

    const formattedPayslips = payslips.map((p) => ({
      id: p._id,
      monthYear: p.monthYear,
      status: p.status,
      basicPay: `₹${p.basicPay}`,
      allowances: `+₹${p.allowances}`,
      deductions: `-₹${p.deductions}`,
      netSalary: `₹${p.netSalary}`,
      downloadUrl: `/api/${organisation}/payroll/download/${p._id}.pdf`,
    }));

    return res.status(200).json({
      status: true,
      message: "Monthly payslips fetched successfully",
      data: formattedPayslips,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch payslips",
      error: error.message,
    });
  }
};

/**
 * Download Payslip PDF Endpoint
 */
export const downloadPayslip = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { id } = req.body;

    const payslip = await payrollRepository.findPayslipById(id);
    if (!payslip || payslip.organisation !== organisation) {
      return res.status(404).json({
        status: false,
        message: "Payslip not found in this organisation",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Payslip download link generated",
      data: {
        id: payslip._id,
        monthYear: payslip.monthYear,
        downloadUrl: payslip.pdfUrl || `https://api.sidegigs.com/downloads/payslips/${payslip._id}.pdf`,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to download payslip",
      error: error.message,
    });
  }
};
