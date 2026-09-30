import express from "express";
import {
  getOrganisationByEmail,
  generateEmailToken,
  verifyToken,
  emailLogin,
  createHrUser,
} from "../controllers/authController.js";
import { validateRegister } from "../requests/registerRequest.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/create-hr:
 *   post:
 *     summary: Create a new HR user account with business preferences and location
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 example: "jane.doe@sidegigs.com"
 *               password:
 *                 type: string
 *                 example: "SecurePass123!"
 *               phone_number:
 *                 type: string
 *                 example: "+919876543210"
 *               is_company:
 *                 type: boolean
 *                 example: true
 *               is_individual:
 *                 type: boolean
 *                 example: false
 *               business_name:
 *                 type: string
 *                 example: "SideGigs HR Technologies"
 *               business_type:
 *                 type: string
 *                 example: "Human Resources"
 *               location_text:
 *                 type: string
 *                 example: "Bangalore, India"
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                     example: "Point"
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [77.5946, 12.9716]
 *                     description: "[longitude, latitude]"
 *               is_hire_works:
 *                 type: boolean
 *                 example: true
 *               is_manage_attendance:
 *                 type: boolean
 *                 example: true
 *               is_manage_jobs:
 *                 type: boolean
 *                 example: true
 *               is_find_temporary_works:
 *                 type: boolean
 *                 example: false
 *               organisation:
 *                 type: string
 *                 example: "sidegigs"
 *     responses:
 *       201:
 *         description: HR user account created successfully
 *       409:
 *         description: User with this email already exists
 *       422:
 *         description: Validation error
 */
router.post("/create-hr", validateRegister, createHrUser);
router.post("/register-hr", validateRegister, createHrUser);
router.post("/register", validateRegister, createHrUser);

/**
 * @swagger
 * /api/auth/get-organisation:
 *   post:
 *     summary: Public API to get organisation by email (returns user_type "owner" if in User schema, "worker" if in Employee schema)
 *     tags: [Auth Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "prashob@gmail.com"
 *     responses:
 *       200:
 *         description: Organisation retrieved successfully (user_type "owner" or "worker")
 *       404:
 *         description: Email not found
 *       422:
 *         description: Validation Error
 */
router.post("/get-organisation", getOrganisationByEmail);
router.post("/organisation", getOrganisationByEmail);

/**
 * @swagger
 * /api/auth/generate-email-token:
 *   post:
 *     summary: Request temporary email verification token for login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "info@gmail.com"
 *     responses:
 *       200:
 *         description: Email token generated successfully
 */
router.post("/generate-email-token", generateEmailToken);

/**
 * @swagger
 * /api/auth/verify-token:
 *   post:
 *     summary: Verify email token and password for login via Remote API
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emailToken, password]
 *             properties:
 *               emailToken:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token verified and login details returned
 */
router.post("/verify-token", verifyToken);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Direct Email and Password Login (with optional organisation)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "info@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Admin123,."
 *               organisation:
 *                 type: string
 *                 example: "sidegigs"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", emailLogin);
router.post("/email-login", emailLogin);

export default router;
