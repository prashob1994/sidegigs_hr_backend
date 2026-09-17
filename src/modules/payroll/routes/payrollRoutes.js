import express from "express";
import {
  getPayrollSummary,
  getMonthlyPayslips,
  downloadPayslip,
} from "../controllers/payrollController.js";
import { validateDownloadPayslip } from "../requests/payrollRequest.js";
import authenticateUser from "../../../middlewares/authenticateUser.js";

const payrollRouter = express.Router({ mergeParams: true });
payrollRouter.use(authenticateUser);

/**
 * @swagger
 * /api/{organisation}/payroll/summary:
 *   post:
 *     summary: Fetch Payroll Budget and Claims summary stats
 *     tags: [Payroll & Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisation
 *         required: true
 *         schema:
 *           type: string
 *         example: "sidegigs"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Payroll summary stats retrieved
 */
payrollRouter.post("/summary", getPayrollSummary);

/**
 * @swagger
 * /api/{organisation}/payroll/payslips:
 *   post:
 *     summary: Fetch Monthly Payslips roster
 *     tags: [Payroll & Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisation
 *         required: true
 *         schema:
 *           type: string
 *         example: "sidegigs"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Monthly payslips roster retrieved
 */
payrollRouter.post("/payslips", getMonthlyPayslips);

/**
 * @swagger
 * /api/{organisation}/payroll/download-payslip:
 *   post:
 *     summary: Download Payslip PDF
 *     tags: [Payroll & Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisation
 *         required: true
 *         schema:
 *           type: string
 *         example: "sidegigs"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *     responses:
 *       200:
 *         description: Download link generated
 *       422:
 *         description: Validation error
 */
payrollRouter.post("/download-payslip", validateDownloadPayslip, downloadPayslip);

export default payrollRouter;
