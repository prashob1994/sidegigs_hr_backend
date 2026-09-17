import mongoose from "mongoose";

const payslipSchema = new mongoose.Schema(
  {
    organisation: {
      type: String,
      required: true,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    employeeName: {
      type: String,
      default: "Employee",
    },
    monthYear: {
      type: String,
      required: true, // e.g. "August 2026"
    },
    basicPay: {
      type: Number,
      default: 140000,
    },
    allowances: {
      type: Number,
      default: 45000,
    },
    deductions: {
      type: Number,
      default: 18500,
    },
    netSalary: {
      type: Number,
      default: 166500,
    },
    status: {
      type: String,
      enum: ["PAID", "PENDING"],
      default: "PAID",
    },
    pdfUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Payslip = mongoose.model("Payslip", payslipSchema);

export default Payslip;
