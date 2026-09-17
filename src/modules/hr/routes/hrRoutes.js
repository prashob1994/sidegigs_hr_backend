import express from "express";
import {
  listEmployees,
  getOrgTree,
  addEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/hrController.js";
import { validateCreateEmployee } from "../requests/employeeRequest.js";
import authenticateUser from "../../../middlewares/authenticateUser.js";

const employeeRouter = express.Router({ mergeParams: true });
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
 *                 example: "Aarav"
 *               department:
 *                 type: string
 *                 enum: [All, Engineering, Design, HR, Product]
 *                 example: "Engineering"
 *               status:
 *                 type: string
 *                 enum: [active, inactive, on_leave, terminated]
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Employees list returned successfully
 */
employeeRouter.post("/list", listEmployees);

/**
 * @swagger
 * /api/{organisation}/employees/org-tree:
 *   post:
 *     summary: Fetch organizational reporting tree
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
 *               department:
 *                 type: string
 *                 enum: [All, Engineering, Design, HR, Product]
 *                 example: "All"
 *     responses:
 *       200:
 *         description: Organizational hierarchy tree fetched successfully
 */
employeeRouter.post("/org-tree", getOrgTree);

/**
 * @swagger
 * /api/{organisation}/employees/add:
 *   post:
 *     summary: Add / Onboard employee under specified organisation
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Aarav Sharma"
 *               email:
 *                 type: string
 *                 example: "aarav@sidegigs.com"
 *               phone:
 *                 type: string
 *                 example: "+919845011223"
 *               designation:
 *                 type: string
 *                 example: "Chief Technology Officer"
 *               department:
 *                 type: string
 *                 enum: [Engineering, Design, HR, Product]
 *                 example: "Engineering"
 *               reportsTo:
 *                 type: string
 *                 description: Manager Employee ID for Org Tree
 *               workplaceType:
 *                 type: string
 *                 enum: [On-Site, Remote, Hybrid]
 *                 example: "On-Site"
 *               salary:
 *                 type: number
 *                 example: 150000
 *               status:
 *                 type: string
 *                 enum: [active, inactive, on_leave, terminated]
 *                 example: "active"
 *     responses:
 *       201:
 *         description: Employee added successfully
 *       422:
 *         description: Validation error
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
 *               name:
 *                 type: string
 *                 example: "Aarav Sharma"
 *               email:
 *                 type: string
 *                 example: "aarav@sidegigs.com"
 *               phone:
 *                 type: string
 *                 example: "+919845011223"
 *               department:
 *                 type: string
 *                 example: "Engineering"
 *               designation:
 *                 type: string
 *                 example: "Chief Technology Officer"
 *               reportsTo:
 *                 type: string
 *               workplaceType:
 *                 type: string
 *                 enum: [On-Site, Remote, Hybrid]
 *     responses:
 *       200:
 *         description: Employee updated successfully
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
 *         description: Employee deleted successfully
 */
employeeRouter.post("/delete", deleteEmployee);

export default employeeRouter;
