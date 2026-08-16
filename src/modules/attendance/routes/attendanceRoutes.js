import express from "express";
import {
  clockIn,
  clockOut,
  getStatus,
  getHistory,
  getAllEmployeesHistory,
  getDailyReport,
} from "../controllers/attendanceController.js";
import authenticateUser from "../../../middlewares/authenticateUser.js";

const attendanceRouter = express.Router({ mergeParams: true });

// Apply authentication to attendance endpoints
attendanceRouter.use(authenticateUser);

/**
 * @swagger
 * /api/{organisation}/attendance/clock-in:
 *   post:
 *     summary: Employee Clock In for today
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId]
 *             properties:
 *               employeeId:
 *                 type: string
 *                 example: "67b0a1..."
 *               employeeName:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: Clocked in successfully
 *       400:
 *         description: Already clocked in for today
 */
attendanceRouter.post("/clock-in", clockIn);

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId]
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
 *     summary: HR Endpoint to get all employees attendance history for organisation
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
 *                 description: Search by employee name
 *               status:
 *                 type: string
 *                 enum: [clocked_in, clocked_out]
 *     responses:
 *       200:
 *         description: All employees attendance history logs
 */
attendanceRouter.post("/all-history", getAllEmployeesHistory);
attendanceRouter.post("/organisation-history", getAllEmployeesHistory);

/**
 * @swagger
 * /api/{organisation}/attendance/daily-report:
 *   post:
 *     summary: Get daily attendance summary (Clocked In vs Absent / Not Clocked In)
 *     tags: [Attendance Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisation
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 example: "2026-08-16"
 *     responses:
 *       200:
 *         description: Daily attendance report
 */
attendanceRouter.post("/daily-report", getDailyReport);

export default attendanceRouter;
