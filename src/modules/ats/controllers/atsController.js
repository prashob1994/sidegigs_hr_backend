import atsRepository from "../repositories/atsRepository.js";

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
    if (req.body.department && req.body.department !== "All") {
      filter.department = req.body.department;
    }

    const jobs = await atsRepository.findJobsByOrganisation(organisation, filter);
    const counts = await atsRepository.getCounts(organisation);

    const formattedJobs = jobs.map((job) => ({
      id: job._id,
      title: job.title,
      department: job.department,
      jobType: job.jobType,
      workplaceType: job.workplaceType,
      location: job.location,
      deadline: job.deadline ? `Deadline: ${new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "No Deadline",
      applicantsCount: job.applicantsCount,
      status: job.status,
    }));

    return res.status(200).json({
      status: true,
      message: `Active jobs for ${organisation}`,
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
 * Create a new job posting (Create Job Opening Modal - Image 4)
 */
export const createJob = async (req, res) => {
  try {
    const organisation = req.params.organisation;
    const { title, department, workplaceType, location, deadline } = req.body;

    const job = await atsRepository.createJob({
      organisation,
      title,
      department: department || "Engineering",
      jobType: "Full Time",
      workplaceType: workplaceType || "Remote",
      location: location || "HQ Bangalore",
      deadline: deadline ? new Date(deadline) : null,
    });

    return res.status(201).json({
      status: true,
      message: "Job opening published successfully to ATS portal",
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
