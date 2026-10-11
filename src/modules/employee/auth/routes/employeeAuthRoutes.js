import express from "express";
import { employeeLogin } from "../controllers/employeeAuthController.js";

const employeeAuthRouter = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/employee/auth/login:
 *   post:
 *     summary: Employee Login using username and password
 *     tags: [Employee Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Employee email address or Employee Code
 *                 example: "prashob@gmail.com"
 *               password:
 *                 type: string
 *                 description: Employee password
 *                 example: "Password123"
 *               organisation:
 *                 type: string
 *                 description: Optional organisation filter
 *                 example: "sidegigs"
 *     responses:
 *       200:
 *         description: Employee authenticated successfully
 *       401:
 *         description: Invalid credentials
 *       422:
 *         description: Validation Error
 *
 * /api/{organisation}/auth/login:
 *   post:
 *     summary: Employee Login scoped to organisation
 *     tags: [Employee Auth]
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
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Employee email address or Employee Code
 *                 example: "prashob@gmail.com"
 *               password:
 *                 type: string
 *                 description: Employee password
 *                 example: "Password123"
 *     responses:
 *       200:
 *         description: Employee authenticated successfully
 *       401:
 *         description: Invalid credentials
 *       422:
 *         description: Validation Error
 */
employeeAuthRouter.post("/login", employeeLogin);

export default employeeAuthRouter;
