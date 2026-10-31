import express from "express";
import {
  listJobs,
  createJob,
  updateJob,
  deleteJob,
  listApplicants,
  createApplicant,
  advanceToNextStage,
  changeApplicantStage,
  listManagerByStatus,
  changeStatus,
  syncApplication,
} from "../controllers/atsController.js";
import {
  validateCreateJob,
  validateUpdateJob,
  validateDeleteJob,
  validateCreateApplicant,
  validateApplicantAction,
  validateChangeStage,
  validateManagerEnquiry,
  validateChangeStatus,
  validateSyncApplication,
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
 * /api/{organisation}/ats/jobs/update:
 *   post:
 *     summary: Update an existing job posting and synchronize with sidegigs_backend
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
 *               id:
 *                 type: string
 *                 description: Mongo _id, key_id, or job_id
 *                 example: "64e0a1b2c3d4e5f678901234"
 *               job_title:
 *                 type: string
 *                 example: "Lead Full Stack Engineer"
 *               company:
 *                 type: string
 *                 example: "SideGigs HR"
 *               job_description:
 *                 type: string
 *                 example: "Updated job description"
 *               status:
 *                 type: string
 *                 enum: [open, closed]
 *                 example: "open"
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       404:
 *         description: Job posting not found
 *       422:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
atsRouter.post("/jobs/update", validateUpdateJob, updateJob);

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

/**
 * @swagger
 * /api/{organisation}/ats/applications/sync:
 *   post:
 *     summary: Synchronize candidate application from sidegigs_backend into SideGigs HR ATS
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
 *               hr_job_id:
 *                 type: string
 *                 example: "64e0a1b2c3d4e5f678901234"
 *               candidateName:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               resume:
 *                 type: string
 *                 example: "https://api.sidegigs.app/uploads/resumes/resume.pdf"
 *     responses:
 *       201:
 *         description: Application synchronized successfully
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
atsRouter.post("/applications/sync", validateSyncApplication, syncApplication);
atsRouter.post("/sync-application", validateSyncApplication, syncApplication);

/**
 * @swagger
 * /api/{organisation}/ats/jobs/delete:
 *   post:
 *     summary: Delete a job posting and sync deletion with sidegigs_backend
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
 *               id:
 *                 type: string
 *                 example: "64e0a1b2c3d4e5f678901234"
 *               job_id:
 *                 type: string
 *                 example: "JOB-102948"
 *               key_id:
 *                 type: number
 *                 example: 101
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
atsRouter.post("/jobs/delete", validateDeleteJob, deleteJob);
atsRouter.delete("/jobs/delete", validateDeleteJob, deleteJob);
atsRouter.delete("/jobs/:id", validateDeleteJob, deleteJob);

/**
 * @swagger
 * /api/{organisation}/ats/jobs/change_status:
 *   post:
 *     summary: Change application status (accepted, rejected, default pending) and sync to sidegigs_backend
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
 *               id:
 *                 type: string
 *                 description: Application UserJob key_id or Mongo _id
 *                 example: 101
 *               job_id:
 *                 type: number
 *                 description: UserJob key_id
 *                 example: 101
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected, pending]
 *                 default: pending
 *                 example: "accepted"
 *               stage:
 *                 type: string
 *                 enum: [Applied, Screening, Interview, Offered, Hired, Rejected]
 *                 example: "Hired"
 *     responses:
 *       200:
 *         description: Job status updated successfully
 *       404:
 *         description: Job application not found
 *       500:
 *         description: Internal server error
 */
atsRouter.post("/jobs/change_status", validateChangeStatus, changeStatus);
atsRouter.post("/jobs/change-status", validateChangeStatus, changeStatus);
atsRouter.post("/enquiries/change_status", validateChangeStatus, changeStatus);
atsRouter.post("/enquiries/change-status", validateChangeStatus, changeStatus);

export default atsRouter;
