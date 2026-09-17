import express from "express";
import { getDashboardOverview, getDashboardEvents } from "../controllers/dashboardController.js";
import authenticateUser from "../../../middlewares/authenticateUser.js";

const dashboardRouter = express.Router({ mergeParams: true });
dashboardRouter.use(authenticateUser);

/**
 * @swagger
 * /api/{organisation}/dashboard/overview:
 *   post:
 *     summary: Fetch Executive Overview dashboard pulse stats
 *     tags: [Executive Dashboard]
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
 *         description: Dashboard overview stats fetched successfully
 */
dashboardRouter.post("/overview", getDashboardOverview);

/**
 * @swagger
 * /api/{organisation}/dashboard/events:
 *   post:
 *     summary: Fetch Out-of-Office events & birthday roster
 *     tags: [Executive Dashboard]
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
 *               type:
 *                 type: string
 *                 enum: [leaves, birthdays]
 *                 example: "leaves"
 *     responses:
 *       200:
 *         description: Out of office events fetched successfully
 */
dashboardRouter.post("/events", getDashboardEvents);

export default dashboardRouter;
