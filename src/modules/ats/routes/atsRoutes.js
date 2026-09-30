import express from "express";
import {
  listJobs,
  createJob,
  listApplicants,
  createApplicant,
  advanceToNextStage,
  changeApplicantStage,
  listManagerByStatus,
} from "../controllers/atsController.js";
import {
  validateCreateJob,
  validateCreateApplicant,
  validateApplicantAction,
  validateChangeStage,
  validateManagerEnquiry,
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
 *     summary: Create job posting with complete job details and GeoJSON location
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
 *             required: [job_title, company]
 *             properties:
 *               job_id:
 *                 type: string
 *                 example: "JOB-102948"
 *               job_title:
 *                 type: string
 *                 example: "Senior Node.js Backend Engineer"
 *               company:
 *                 type: string
 *                 example: "SideGigs HR Tech"
 *               job_description:
 *                 type: string
 *                 example: "Looking for an experienced Node.js engineer to build scalable microservices."
 *               payment:
 *                 type: string
 *                 example: "120000"
 *               payment_type:
 *                 type: string
 *                 example: "monthly"
 *               job_requirements:
 *                 type: string
 *                 example: "5+ years of experience in Node.js, Express, MongoDB, and Redis."
 *               location_text:
 *                 type: string
 *                 example: "Bangalore, India (Hybrid)"
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
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-10-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-11-01"
 *               start_time:
 *                 type: string
 *                 example: "09:00 AM"
 *               end_time:
 *                 type: string
 *                 example: "06:00 PM"
 *               created_by:
 *                 type: number
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [open, closed]
 *                 example: "open"
 *               category:
 *                 type: string
 *                 example: "Software Engineering"
 *               phone_number:
 *                 type: string
 *                 example: "+919876543210"
 *               is_verified:
 *                 type: boolean
 *                 example: true
 *               collect_phone:
 *                 type: boolean
 *                 example: true
 *               collect_resume:
 *                 type: boolean
 *                 example: true
 *               logo:
 *                 type: string
 *                 example: "https://cdn.sidegigs.com/logos/company.png"
 *     responses:
 *       201:
 *         description: Job posting created successfully
 *       422:
 *         description: Validation error
 *       500:
 *         description: Server error
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

/**
 * @swagger
 * /api/{organisation}/ats/jobs/manager_enquiry:
 *   post:
 *     summary: job enquiry
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
 *             properties:
 *               enquiry_type:
 *                 type: string
 *                 description: "enquiry type status (1 => accepted , 0=> pending, rejected)"
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Job listed successfully
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
atsRouter.post("/jobs/manager_enquiry", validateManagerEnquiry, listManagerByStatus);

export default atsRouter;
