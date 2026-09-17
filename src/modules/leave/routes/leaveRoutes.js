import express from "express";
import {
  applyLeave,
  myLeaves,
  listLeaves,
  changeLeaveStatus,
  getApprovalsList,
  approveLeave,
  rejectLeave,
} from "../controllers/leaveController.js";
import { validateLeaveAction } from "../requests/leaveRequest.js";
import authenticateUser from "../../../middlewares/authenticateUser.js";

const leaveRouter = express.Router({ mergeParams: true });
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
 *               employeeId:
 *                 type: string
 *               leaveType:
 *                 type: string
 *                 enum: [sick, casual, annual, unpaid]
 *                 example: "annual"
 *               leaveTitle:
 *                 type: string
 *                 example: "Annual Vacation"
 *               startDate:
 *                 type: string
 *                 example: "2026-09-05"
 *               endDate:
 *                 type: string
 *                 example: "2026-09-08"
 *               reason:
 *                 type: string
 *                 example: "Family trip to Himachal. Sprint deliverables completed."
 *               urgency:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Leave application submitted successfully
 *       422:
 *         description: Validation error
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
 *         example: "sidegigs"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [all, pending, approved, rejected]
 *                 example: "pending"
 *     responses:
 *       200:
 *         description: List of organisation leave requests
 */
leaveRouter.post("/list", listLeaves);

/**
 * @swagger
 * /api/{organisation}/leave/approvals-list:
 *   post:
 *     summary: Fetch formatted time-off request cards for mobile approvals screen
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [all, pending, approved, rejected]
 *                 example: "pending"
 *     responses:
 *       200:
 *         description: Formatted time-off approval cards fetched successfully
 */
leaveRouter.post("/approvals-list", getApprovalsList);

/**
 * @swagger
 * /api/{organisation}/leave/approve:
 *   post:
 *     summary: Approve leave request
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
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *     responses:
 *       200:
 *         description: Leave application approved successfully
 *       422:
 *         description: Validation error
 */
leaveRouter.post("/approve", validateLeaveAction, approveLeave);

/**
 * @swagger
 * /api/{organisation}/leave/reject:
 *   post:
 *     summary: Reject leave request
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
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *               rejectionReason:
 *                 type: string
 *                 example: "Project sprint release scheduled during requested dates"
 *     responses:
 *       200:
 *         description: Leave application rejected successfully
 *       422:
 *         description: Validation error
 */
leaveRouter.post("/reject", validateLeaveAction, rejectLeave);

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
 *         example: "sidegigs"
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
 *                 example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 example: "approved"
 *     responses:
 *       200:
 *         description: Leave status updated successfully
 */
leaveRouter.post("/change-status", changeLeaveStatus);

export default leaveRouter;
