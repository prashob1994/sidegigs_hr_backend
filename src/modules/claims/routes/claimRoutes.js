import express from "express";
import {
  getClaimsSummary,
  listClaims,
  createClaim,
  approveClaim,
  rejectClaim,
} from "../controllers/claimController.js";
import { validateCreateClaim, validateClaimAction } from "../requests/claimRequest.js";
import authenticateUser from "../../../middlewares/authenticateUser.js";

const claimRouter = express.Router({ mergeParams: true });
claimRouter.use(authenticateUser);

/**
 * @swagger
 * /api/{organisation}/claims/summary:
 *   post:
 *     summary: Get claims summary
 *     tags: [Claims & Payroll]
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
 *         description: Claims summary retrieved
 */
claimRouter.post("/summary", getClaimsSummary);

/**
 * @swagger
 * /api/{organisation}/claims/list:
 *   post:
 *     summary: List claims formatted for mobile roster
 *     tags: [Claims & Payroll]
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
 *         description: Claims list retrieved successfully
 */
claimRouter.post("/list", listClaims);

/**
 * @swagger
 * /api/{organisation}/claims/create:
 *   post:
 *     summary: Create new expense claim
 *     tags: [Claims & Payroll]
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
 *             required: [title, amount]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "JetBrains All Products Annual License Pack"
 *               description:
 *                 type: string
 *                 example: "Annual IDE subscription for software engineering team"
 *               category:
 *                 type: string
 *                 example: "Software"
 *               amount:
 *                 type: number
 *                 example: 4500
 *     responses:
 *       201:
 *         description: Claim created successfully
 *       422:
 *         description: Validation error
 */
claimRouter.post("/create", validateCreateClaim, createClaim);

/**
 * @swagger
 * /api/{organisation}/claims/approve:
 *   post:
 *     summary: Approve expense claim
 *     tags: [Claims & Payroll]
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
 *         description: Expense claim approved
 *       422:
 *         description: Validation error
 */
claimRouter.post("/approve", validateClaimAction, approveClaim);

/**
 * @swagger
 * /api/{organisation}/claims/reject:
 *   post:
 *     summary: Reject expense claim
 *     tags: [Claims & Payroll]
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
 *                 example: "Receipt missing or invalid vendor invoice"
 *     responses:
 *       200:
 *         description: Expense claim rejected
 *       422:
 *         description: Validation error
 */
claimRouter.post("/reject", validateClaimAction, rejectClaim);

export default claimRouter;
