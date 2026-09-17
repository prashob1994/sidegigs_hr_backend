import express from "express";
import {
  listJobs,
  createJob,
  listApplicants,
  createApplicant,
  advanceToNextStage,
  changeApplicantStage,
} from "../controllers/atsController.js";
import {
  validateCreateJob,
  validateCreateApplicant,
  validateApplicantAction,
  validateChangeStage,
} from "../requests/atsRequest.js";
import authenticateUser from "../../../middlewares/authenticateUser.js";

const atsRouter = express.Router({ mergeParams: true });
atsRouter.use(authenticateUser);

/**
 * @swagger
 * /api/{organisation}/ats/jobs/list:
 *   post:
 *     summary: List active jobs & recruitment statistics
 *     tags: [ATS Recruitment]
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
 *                 example: "active"
 *               department:
 *                 type: string
 *                 example: "Engineering"
 *     responses:
 *       200:
 *         description: Active jobs list fetched successfully
 */
atsRouter.post("/jobs/list", listJobs);

/**
 * @swagger
 * /api/{organisation}/ats/jobs/create:
 *   post:
 *     summary: Create job opening publishing position to ATS portal
 *     tags: [ATS Recruitment]
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
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Lead Mobile Architect (Flutter)"
 *               department:
 *                 type: string
 *                 enum: [Engineering, Design, HR, Product]
 *                 example: "Engineering"
 *               workplaceType:
 *                 type: string
 *                 enum: [Remote, Onsite, Hybrid]
 *                 example: "Remote"
 *               location:
 *                 type: string
 *                 example: "HQ Bangalore / Remote"
 *               deadline:
 *                 type: string
 *                 example: "2026-09-30"
 *     responses:
 *       201:
 *         description: Job posting created successfully
 *       422:
 *         description: Validation error
 */
atsRouter.post("/jobs/create", validateCreateJob, createJob);

/**
 * @swagger
 * /api/{organisation}/ats/applicants/list:
 *   post:
 *     summary: List job applicants
 *     tags: [ATS Recruitment]
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
 *               jobId:
 *                 type: string
 *               stage:
 *                 type: string
 *                 example: "Sourced"
 *     responses:
 *       200:
 *         description: Applicants list fetched successfully
 */
atsRouter.post("/applicants/list", listApplicants);

/**
 * @swagger
 * /api/{organisation}/ats/applicants/create:
 *   post:
 *     summary: Insert candidate into ATS recruitment pipeline
 *     tags: [ATS Recruitment]
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
 *             required: [candidateName]
 *             properties:
 *               candidateName:
 *                 type: string
 *                 example: "Karthik Raja"
 *               email:
 *                 type: string
 *                 example: "karthik.raja@devops.co"
 *               phone:
 *                 type: string
 *                 example: "+919811122233"
 *               appliedRole:
 *                 type: string
 *                 example: "Senior Flutter Developer"
 *               jobId:
 *                 type: string
 *               linkedinUrl:
 *                 type: string
 *                 example: "https://linkedin.com/in/karthikraja"
 *               notes:
 *                 type: string
 *                 example: "Sourced via GitHub. Open-source maintainer with active contributions."
 *     responses:
 *       201:
 *         description: Candidate added to recruitment pipeline successfully
 *       422:
 *         description: Validation error
 */
atsRouter.post("/applicants/create", validateCreateApplicant, createApplicant);

/**
 * @swagger
 * /api/{organisation}/ats/applicants/next-stage:
 *   post:
 *     summary: Move candidate to next recruitment stage in pipeline
 *     tags: [ATS Recruitment]
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
 *         description: Candidate moved to next stage successfully
 *       422:
 *         description: Validation error
 */
atsRouter.post("/applicants/next-stage", validateApplicantAction, advanceToNextStage);

/**
 * @swagger
 * /api/{organisation}/ats/applicants/change-stage:
 *   post:
 *     summary: Update applicant recruitment stage directly
 *     tags: [ATS Recruitment]
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
 *             required: [id, stage]
 *             properties:
 *               id:
 *                 type: string
 *                 example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *               stage:
 *                 type: string
 *                 enum: [Sourced, Screening, Interview, Offered, Hired, Rejected]
 *                 example: "Interview"
 *     responses:
 *       200:
 *         description: Candidate stage updated successfully
 *       422:
 *         description: Validation error
 */
atsRouter.post("/applicants/change-stage", validateChangeStage, changeApplicantStage);

export default atsRouter;
