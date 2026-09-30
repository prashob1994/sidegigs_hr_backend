import atsRepository from "../repositories/atsRepository.js";
import Job from "../models/jobModel.js";
import User from "../../auth/models/userModel.js";

const STAGE_ORDER = ["Sourced", "Screening", "Interview", "Offered", "Hired", "Rejected"];

/**
 * Fetch list of jobs for organisation
 */
export const listJobs = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const filter = {};
    if (req.body.status) {
      filter.status = req.body.status;
    }
    if (req.body.category) {
      filter.category = req.body.category;
    }

    const jobs = await atsRepository.findJobsByOrganisation(organisation, filter);
    const counts = await atsRepository.getCounts(organisation);

    const formattedJobs = jobs.map((job) => ({
      id: job._id,
      key_id: job.key_id,
      job_id: job.job_id,
      job_title: job.job_title,
      company: job.company,
      job_description: job.job_description,
      payment: job.payment,
      payment_type: job.payment_type,
      job_requirements: job.job_requirements,
      location_text: job.location_text,
      location: job.location,
      start_date: job.start_date,
      end_date: job.end_date,
      start_time: job.start_time,
      end_time: job.end_time,
      created_by: job.created_by,
      status: job.status,
      category: job.category,
      phone_number: job.phone_number,
      is_verified: job.is_verified,
      collect_phone: job.collect_phone,
      collect_resume: job.collect_resume,
      logo: job.logo,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));

    return res.status(200).json({
      status: true,
      message: `Jobs for ${organisation}`,
      data: {
        totalActiveJobs: counts.totalJobs,
        totalApplicants: counts.totalApplicants,
        inInterviewStage: counts.inInterview,
        jobs: formattedJobs,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
};

/**
 * Create a new job posting
 */
export const createJob = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const {
      job_id,
      job_title,
      company,
      job_description,
      payment,
      payment_type,
      job_requirements,
      location_text,
      location,
      start_date,
      end_date,
      start_time,
      end_time,
      created_by,
      status,
      category,
      phone_number,
      is_verified,
      collect_phone,
      collect_resume,
      logo,
    } = req.body;

    let formattedLocation = { type: "Point", coordinates: [0, 0] };
    if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      formattedLocation = {
        type: location.type || "Point",
        coordinates: location.coordinates,
      };
    } else if (Array.isArray(location) && location.length === 2) {
      formattedLocation = {
        type: "Point",
        coordinates: location,
      };
    }

    const jobData = {
      job_id: job_id || `JOB-${Date.now()}`,
      job_title,
      company: company || organisation || "SideGigs",
      job_description: job_description || "",
      payment: payment || "",
      payment_type: payment_type || "",
      job_requirements: job_requirements || "",
      location_text: location_text || "",
      location: formattedLocation,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
      start_time: start_time || null,
      end_time: end_time || null,
      created_by: created_by || req.user?.key_id || 1,
      status: status || "open",
      category: category || "",
      phone_number: phone_number || "",
      is_verified: is_verified !== undefined ? is_verified : false,
      collect_phone: collect_phone !== undefined ? collect_phone : false,
      collect_resume: collect_resume !== undefined ? collect_resume : false,
      logo: logo || null,
    };

    const job = await atsRepository.createJob(jobData);

    return res.status(201).json({
      status: true,
      message: "Job opening published successfully",
      data: job,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to create job posting",
      error: error.message,
    });
  }
};

/**
 * List applicants for organisation / job
 */
export const listApplicants = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const filter = {};
    if (req.body.jobId) filter.jobId = req.body.jobId;
    if (req.body.stage) filter.stage = req.body.stage;

    const applicants = await atsRepository.findApplicantsByOrganisation(organisation, filter);

    const formattedApplicants = applicants.map((app) => {
      const initials = app.candidateName
        ? app.candidateName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
        : "KR";

      return {
        id: app._id,
        candidateName: app.candidateName,
        initials,
        email: app.email,
        phone: app.phone,
        appliedRole: app.appliedRole || app.jobId?.title || "Senior Flutter Developer",
        rating: app.rating || 4.6,
        sourcedVia: app.notes || app.sourcedVia || "Sourced via GitHub. Open-source maintainer with active contributions.",
        attachmentsText: app.attachmentsText || "1 Attachments (Resume, Portfolio)",
        appliedAgo: "Applied Yesterday",
        linkedinUrl: app.linkedinUrl || `https://linkedin.com/in/${app.candidateName.toLowerCase().replace(/\s+/g, "")}`,
        stage: app.stage || "Sourced",
      };
    });

    return res.status(200).json({
      status: true,
      message: "Applicants fetched successfully",
      data: formattedApplicants,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch applicants",
      error: error.message,
    });
  }
};

/**
 * Create/Add candidate to ATS recruitment pipeline (Add New Candidate modal)
 */
export const createApplicant = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { candidateName, email, phone, appliedRole, jobId, linkedinUrl, notes } = req.body;

    const applicant = await atsRepository.createApplicant({
      organisation,
      candidateName,
      email: email || null,
      phone: phone || null,
      appliedRole: appliedRole || "Senior Flutter Developer",
      jobId: jobId || null,
      linkedinUrl: linkedinUrl || null,
      notes: notes || null,
      stage: "Sourced",
    });

    return res.status(201).json({
      status: true,
      message: "Candidate inserted into ATS recruitment pipeline successfully",
      data: applicant,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to add candidate",
      error: error.message,
    });
  }
};

/**
 * Move candidate to next stage (Image 2 action button)
 */
export const advanceToNextStage = async (req, res) => {
  try {
    const { id } = req.body;

    const applicant = await atsRepository.findApplicantById(id);
    if (!applicant) {
      return res.status(404).json({
        status: false,
        message: "Candidate applicant not found",
      });
    }

    const currentIndex = STAGE_ORDER.indexOf(applicant.stage || "Sourced");
    const nextIndex = currentIndex < STAGE_ORDER.length - 2 ? currentIndex + 1 : currentIndex;
    const nextStage = STAGE_ORDER[nextIndex];

    const updated = await atsRepository.updateApplicantStage(id, nextStage);

    return res.status(200).json({
      status: true,
      message: `Candidate moved to next stage (${nextStage}) successfully`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to advance candidate stage",
      error: error.message,
    });
  }
};

/**
 * Change applicant stage directly
 */
export const changeApplicantStage = async (req, res) => {
  try {
    const { id, stage } = req.body;
    const updated = await atsRepository.updateApplicantStage(id, stage);
    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Applicant not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: `Applicant stage updated to ${stage}`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to update stage",
      error: error.message,
    });
  }
};

/**
 * Job Manager Enquiry (Find who applied to the jobs)
 */
export const listManagerByStatus = async (req, res) => {
  try {
    const filter = {};
    if (req.user && req.user.key_id) {
      filter.created_by = req.user.key_id;
    } else if (req.body.created_by) {
      filter.created_by = req.body.created_by;
    }

    const enquiryOptions = {};
    if (req.body.enquiry_type !== undefined && req.body.enquiry_type !== null) {
      enquiryOptions.type = req.body.enquiry_type;
    }

    const listjob = await atsRepository.listUserJobs(filter, enquiryOptions);

    if (!listjob) {
      return res.status(404).json({
        status: false,
        message: "Failed to list job enquiries",
      });
    }

    const jobIds = listjob.map((job) => job.job_id);
    const userIds = listjob.map((user) => user.user_id);

    const jobs = await Job.find({ key_id: { $in: jobIds } });
    const users = await User.find({ key_id: { $in: userIds } }).select("-password");

    const userMap = Object.fromEntries(
      users.map((user) => [user.key_id || user._id, user])
    );
    const jobMap = Object.fromEntries(
      jobs.map((job) => [job.key_id || job._id, job])
    );

    const enrichedUserJobs = listjob.map((userJob) => {
      const uObj = userJob.toObject ? userJob.toObject() : userJob;
      return {
        ...uObj,
        job: jobMap[userJob.job_id] || null,
        user: userMap[userJob.user_id] || null,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Job enquiries listed successfully",
      data: enrichedUserJobs,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch job enquiries",
      error: error.message,
    });
  }
};
