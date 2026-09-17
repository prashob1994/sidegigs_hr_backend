import claimRepository from "../repositories/claimRepository.js";
import payrollRepository from "../../payroll/repositories/payrollRepository.js";

export const getClaimsSummary = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const summary = await claimRepository.getSummary(organisation);
    return res.status(200).json({
      status: true,
      message: "Claims summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch claims summary",
      error: error.message,
    });
  }
};

export const listClaims = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const filter = {};
    if (req.body.status && req.body.status !== "all") {
      filter.status = req.body.status.toLowerCase();
    }

    const claims = await claimRepository.findByOrganisation(organisation, filter);
    const summary = await claimRepository.getSummary(organisation);
    const payrollSummary = await payrollRepository.getSummary(organisation);

    const formattedClaims = claims.map((c, index) => {
      const submittedTime = c.createdAt
        ? `Submitted ${new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
        : "Submitted Recently";

      return {
        id: c._id,
        claimCode: c.claimCode || `EXP-${1085 + index}`,
        category: c.category || "General",
        status: (c.status || "pending").toUpperCase(),
        employeeName: c.employeeName,
        amountFormatted: `₹${c.amount}`,
        amount: c.amount,
        description: c.description || c.title,
        submittedTime,
        receiptVerified: c.receiptVerified !== undefined ? c.receiptVerified : true,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Claims list fetched successfully",
      data: {
        payrollBudget: payrollSummary.payrollBudgetFormatted,
        disbursedStaffText: payrollSummary.disbursedStaffText,
        pendingClaimsAmount: summary.totalAmountFormatted,
        pendingClaimsReviewText: `${summary.pendingCount} Pending Review`,
        claims: formattedClaims,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch claims list",
      error: error.message,
    });
  }
};

export const createClaim = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { title, description, category, amount } = req.body;
    const count = await claimRepository.findByOrganisation(organisation);

    const claim = await claimRepository.create({
      organisation,
      employeeName: req.user?.name || "Employee",
      employeeId: req.user?.userId || null,
      claimCode: `EXP-${1090 + count.length}`,
      title,
      description: description || title,
      category: category || "Travel & Fuel",
      amount,
      status: "pending",
      receiptVerified: true,
    });

    return res.status(201).json({
      status: true,
      message: "Claim submitted successfully",
      data: claim,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to create claim",
      error: error.message,
    });
  }
};

export const approveClaim = async (req, res) => {
  try {
    const { id } = req.body;
    const updated = await claimRepository.updateStatus(id, "approved");
    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Claim not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Claim approved successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to approve claim",
      error: error.message,
    });
  }
};

export const rejectClaim = async (req, res) => {
  try {
    const { id, rejectionReason } = req.body;
    const updated = await claimRepository.updateStatus(id, "rejected", rejectionReason);
    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Claim not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Claim rejected successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to reject claim",
      error: error.message,
    });
  }
};
