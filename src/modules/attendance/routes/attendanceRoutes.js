import express from "express";
import {
  clockIn,
  clockOut,
  getStatus,
  getHistory,
  getAllEmployeesHistory,
  getDailyReport,
  exportCsv,
} from "../controllers/attendanceController.js";
import { validateClockIn, validateExportCsv } from "../requests/attendanceRequest.js";
import authenticateUser from "../../../middlewares/authenticateUser.js";

const attendanceRouter = express.Router({ mergeParams: true });
attendanceRouter.use(authenticateUser);

/**
 * @swagger
 * /api/{organisation}/attendance/clock-in:
 *   post:
 *     summary: Employee Clock In for today with shift location & tasks
 *     tags: [Attendance]
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
 *               locationType:
 *                 type: string
 *                 enum: ["Office HQ", "Remote WFH", "Client Site"]
 *                 example: "Office HQ"
 *               shiftNotes:
 *                 type: string
 *                 example: "Sprint planning & HR recruitment review"
 *     responses:
 *       201:
 *         description: Clocked in successfully
 *       400:
 *         description: Already clocked in for today
 */
attendanceRouter.post("/clock-in", validateClockIn, clockIn);

/**
 * @swagger
 * /api/{organisation}/attendance/clock-out:
 *   post:
 *     summary: Employee Clock Out for today
 *     tags: [Attendance]
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
 *         description: Clocked out successfully
 *       400:
 *         description: Not currently clocked in
 */
attendanceRouter.post("/clock-out", clockOut);

/**
 * @swagger
 * /api/{organisation}/attendance/status:
 *   post:
 *     summary: Get employee current clock status for today
 *     tags: [Attendance]
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
 *         description: Current clock status
 */
attendanceRouter.post("/status", getStatus);

/**
 * @swagger
 * /api/{organisation}/attendance/history:
 *   post:
 *     summary: Get single employee attendance history logs
 *     tags: [Attendance]
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
 *               startDate:
 *                 type: string
 *                 example: "2026-08-01"
 *               endDate:
 *                 type: string
 *                 example: "2026-08-31"
 *     responses:
 *       200:
 *         description: Single employee attendance history logs
 */
attendanceRouter.post("/history", getHistory);

/**
 * @swagger
 * /api/{organisation}/attendance/all-history:
 *   post:
 *     summary: HR Endpoint to get all employees attendance history roster cards
 *     tags: [Attendance Report]
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
 *               startDate:
 *                 type: string
 *                 example: "2026-08-01"
 *               endDate:
 *                 type: string
 *                 example: "2026-08-31"
 *               keyword:
 *                 type: string
 *                 example: "Aarav"
 *               status:
 *                 type: string
 *                 enum: [all, Present, Late, Absent, Leave]
 *                 example: "all"
 *     responses:
 *       200:
 *         description: All employees attendance history roster
 */
attendanceRouter.post("/all-history", getAllEmployeesHistory);
attendanceRouter.post("/organisation-history", getAllEmployeesHistory);

/**
 * @swagger
 * /api/{organisation}/attendance/daily-report:
 *   post:
 *     summary: Get daily attendance report summary (Present, Absent, Late, On Leave)
 *     tags: [Attendance Report]
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
 *               date:
 *                 type: string
 *                 example: "2026-08-31"
 *     responses:
 *       200:
 *         description: Daily attendance report summary
 */
attendanceRouter.post("/daily-report", getDailyReport);

/**
 * @swagger
 * /api/{organisation}/attendance/export-csv:
 *   post:
 *     summary: Export attendance roster history as CSV
 *     tags: [Attendance Report]
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
 *               startDate:
 *                 type: string
 *                 example: "2026-08-01"
 *               endDate:
 *                 type: string
 *                 example: "2026-08-31"
 *               status:
 *                 type: string
 *                 example: "all"
 *     responses:
 *       200:
 *         description: Attendance CSV data exported successfully
 */
attendanceRouter.post("/export-csv", validateExportCsv, exportCsv);

export default attendanceRouter;
