import express from "express";
import {
  getOrganisationByEmail,
  generateEmailToken,
  verifyToken,
  emailLogin,
  createHrUser,
  updateVerification,
} from "../controllers/authController.js";
import { validateRegister } from "../requests/registerRequest.js";
import { validateVerification } from "../requests/verificationRequest.js";

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
 *
 * /api/auth/register-hr:
 *   post:
 *     summary: Register HR user account (alias for create-hr)
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
 *     responses:
 *       201:
 *         description: HR user account created successfully
 *
 * /api/auth/register:
 *   post:
 *     summary: Register user account (alias for create-hr)
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
 *     responses:
 *       201:
 *         description: User account created successfully
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
 *
 * /api/auth/organisation:
 *   post:
 *     summary: Public API to get organisation by email (alias for get-organisation)
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
 *         description: Organisation retrieved successfully
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
 *
 * /api/auth/email-login:
 *   post:
 *     summary: Direct Email and Password Login (alias for /login)
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

/**
 * @swagger
 * /api/auth/verification:
 *   post:
 *     summary: Update HR user verification status (is_verified) and detail (verified_detail)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: User ID (optional if Bearer token is provided)
 *                 example: "64e0a1b2c3d4e5f678901234"
 *               email:
 *                 type: string
 *                 description: User email (optional if Bearer token is provided)
 *                 example: "info@gmail.com"
 *               is_verified:
 *                 type: boolean
 *                 description: Verification status
 *                 example: true
 *               is_verifed:
 *                 type: boolean
 *                 description: Alias for is_verified
 *                 example: true
 *               verified_detail:
 *                 oneOf:
 *                   - type: string
 *                     example: "Aadhaar verified successfully"
 *                   - type: object
 *                     example: { "method": "aadhaar", "verified_at": "2026-11-03T18:00:00Z" }
 *     responses:
 *       200:
 *         description: Verification status updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *
 * /api/auth/verify:
 *   post:
 *     summary: Update HR user verification status (alias for /verification)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_verified:
 *                 type: boolean
 *                 example: true
 *               verified_detail:
 *                 type: string
 *                 example: "Aadhaar verified successfully"
 *     responses:
 *       200:
 *         description: Verification status updated successfully
 */
router.post("/verification", validateVerification, updateVerification);
router.post("/verify", validateVerification, updateVerification);

export default router;
