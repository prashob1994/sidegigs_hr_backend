import express from "express";
import {
  applyLeave,
  myLeaves,
  listLeaves,
  changeLeaveStatus,
} from "../controllers/leaveController.js";
import authenticateUser from "../../../middlewares/authenticateUser.js";

const leaveRouter = express.Router({ mergeParams: true });

// Apply authentication to leave routes
leaveRouter.use(authenticateUser);

/**
 * @swagger
 * /api/{organisation}/leave/apply:
 *   post:
 *     summary: Apply for leave under specified organisation
 *     tags: [Leave Application]
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
 *             required: [startDate, endDate, reason]
 *             properties:
 *               leaveType:
 *                 type: string
 *                 example: "casual"
 *               startDate:
 *                 type: string
 *                 example: "2026-09-01"
 *               endDate:
 *                 type: string
 *                 example: "2026-09-03"
 *               reason:
 *                 type: string
 *                 example: "Family vacation"
 *     responses:
 *       201:
 *         description: Leave application submitted successfully
 */
leaveRouter.post("/apply", applyLeave);

/**
 * @swagger
 * /api/{organisation}/leave/my-leaves:
 *   post:
 *     summary: List employee's leave applications for specified organisation
 *     tags: [Leave Application]
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
 *               employeeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of employee leaves
 */
leaveRouter.post("/my-leaves", myLeaves);

/**
 * @swagger
 * /api/{organisation}/leave/list:
 *   post:
 *     summary: List all leave applications for specified organisation (HR)
 *     tags: [Leave Application]
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of organisation leave requests
 */
leaveRouter.post("/list", listLeaves);

/**
 * @swagger
 * /api/{organisation}/leave/change-status:
 *   post:
 *     summary: Approve or reject leave application for specified organisation (HR)
 *     tags: [Leave Application]
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
 *             required: [id, status]
 *             properties:
 *               id:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Leave status updated successfully
 */
leaveRouter.post("/change-status", changeLeaveStatus);

export default leaveRouter;
