import express from "express";
import {
  getOrganisationByEmail,
  generateEmailToken,
  verifyToken,
  emailLogin,
} from "../controllers/authController.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/get-organisation:
 *   post:
 *     summary: Public API to get organisation by email
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
 *     summary: Direct Email and Password Login
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
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", emailLogin);
router.post("/email-login", emailLogin);

export default router;
