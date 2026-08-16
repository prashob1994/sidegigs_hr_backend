import express from "express";
import {
  listEmployees,
  addEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/hrController.js";
import { validateCreateEmployee } from "../requests/employeeRequest.js";
import authenticateUser from "../../../middlewares/authenticateUser.js";

const employeeRouter = express.Router({ mergeParams: true });

// Apply authentication to employee routes
employeeRouter.use(authenticateUser);

/**
 * @swagger
 * /api/{organisation}/employees/list:
 *   post:
 *     summary: List employees for specified organisation
 *     tags: [Employee Scoped API]
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
 *               keyword:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employees list returned
 */
employeeRouter.post("/list", listEmployees);

/**
 * @swagger
 * /api/{organisation}/employees/add:
 *   post:
 *     summary: Add employee under specified organisation
 *     tags: [Employee Scoped API]
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@company.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               department:
 *                 type: string
 *               designation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee added successfully
 */
employeeRouter.post("/add", validateCreateEmployee, addEmployee);

/**
 * @swagger
 * /api/{organisation}/employees/get:
 *   post:
 *     summary: Get employee details by ID under specified organisation
 *     tags: [Employee Scoped API]
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
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee details
 */
employeeRouter.post("/get", getEmployee);

/**
 * @swagger
 * /api/{organisation}/employees/update:
 *   post:
 *     summary: Update employee details under specified organisation
 *     tags: [Employee Scoped API]
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
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee updated
 */
employeeRouter.post("/update", updateEmployee);

/**
 * @swagger
 * /api/{organisation}/employees/delete:
 *   post:
 *     summary: Delete employee by ID under specified organisation
 *     tags: [Employee Scoped API]
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
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee deleted
 */
employeeRouter.post("/delete", deleteEmployee);

export default employeeRouter;
