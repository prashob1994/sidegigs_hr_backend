import mongoose from "mongoose";
import Job from "../models/jobModel.js";
import Applicant from "../models/applicantModel.js";
import UserJob from "../models/userJobModel.js";
import User from "../../auth/models/userModel.js";

class AtsRepository {
  async findJobsByOrganisation(organisation, filter = {}) {
    const query = { ...filter };
    if (organisation && organisation !== "all") {
      const orgRegex = new RegExp(`^${organisation}$`, "i");
      query.$or = [
        { organisation: orgRegex },
        {
          $and: [
            {
              $or: [
                { organisation: { $exists: false } },
                { organisation: null },
                { organisation: "" },
              ],
            },
            { company: orgRegex },
          ],
        },
      ];
    }
    return await Job.find(query).sort({ createdAt: -1 });
  }

  async createJob(data) {
    return await Job.create(data);
  }

  async findJobById(id) {
    return await Job.findById(id);
  }

  /**
   * Find existing job by _id, id, job_id, or key_id, optionally scoped to organisation
   * @param {Object} params - { _id, id, job_id, key_id }
   * @param {String} organisation
   */
  async findExistingJob(params = {}, organisation = null) {
    const { _id, id, job_id, key_id } = params;
    const orgFilter = (organisation && organisation !== "all")
      ? {
          $or: [
            { organisation: new RegExp(`^${organisation}$`, "i") },
            {
              $and: [
                {
                  $or: [
                    { organisation: { $exists: false } },
                    { organisation: null },
                    { organisation: "" },
                  ],
                },
                { company: new RegExp(`^${organisation}$`, "i") },
              ],
            },
          ],
        }
      : {};

    const lookupId = _id || id;
    if (lookupId && mongoose.Types.ObjectId.isValid(lookupId)) {
      const job = await Job.findOne({ _id: lookupId, ...orgFilter });
      if (job) return job;
    }
    if (job_id) {
      const job = await Job.findOne({ job_id: String(job_id), ...orgFilter });
      if (job) return job;
    }
    if (key_id !== undefined && key_id !== null && !isNaN(Number(key_id))) {
      const job = await Job.findOne({ key_id: Number(key_id), ...orgFilter });
      if (job) return job;
    }
    if (lookupId) {
      const job = await this.findJobByIdOrKey(lookupId);
      if (job) {
        if (!organisation || organisation === "all" || !job.organisation || job.organisation.toLowerCase() === organisation.toLowerCase()) {
          return job;
        }
      }
    }
    return null;
  }

  /**
   * Find job by Mongo _id, numeric key_id, or string job_id
   * @param {String|Number} id
   */
  async findJobByIdOrKey(id) {
    if (!id) return null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      const job = await Job.findById(id);
      if (job) return job;
    }
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      const job = await Job.findOne({ key_id: numericId });
      if (job) return job;
    }
    return await Job.findOne({ job_id: String(id) });
  }

  /**
   * Update a job by ID, key_id, or job_id
   * @param {String|Number} id
   * @param {Object} data
   */
  async updateJob(id, data) {
    if (!id) return null;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else if (!isNaN(Number(id))) {
      query = { key_id: Number(id) };
    } else {
      query = { job_id: String(id) };
    }
    return await Job.findOneAndUpdate(query, data, { new: true });
  }

  async findApplicantById(id) {
    return await Applicant.findById(id);
  }

  async findApplicantsByOrganisation(organisation, filter = {}) {
    const query = { ...filter };
    if (organisation && organisation !== "all") {
      query.organisation = new RegExp(`^${organisation}$`, "i");
    }
    return await Applicant.find(query)
      .populate("jobId", "job_title company category organisation")
      .sort({ createdAt: -1 });
  }

  async createApplicant(data) {
    const applicant = await Applicant.create(data);
    return applicant;
  }

  async createUserJob(data) {
    const userJob = await UserJob.create(data);
    return userJob;
  }

  async updateApplicantStage(id, stage) {
    return await Applicant.findByIdAndUpdate(id, { stage }, { new: true });
  }

  async listUserJobs(filter = {}, enquiryOptions = {}) {
    const query = { ...filter };
    if (enquiryOptions.type !== undefined && enquiryOptions.type !== null && enquiryOptions.type !== "") {
      const typeVal = String(enquiryOptions.type);
      if (typeVal === "1") {
        query.status = "accepted";
      } else if (typeVal === "0") {
        query.status = { $in: ["pending", "rejected"] };
      } else {
        query.status = typeVal;
      }
    }
    return await UserJob.find(query).sort({ createdAt: -1 });
  }

  async getCounts(organisation) {
    const jobFilter = { status: "open" };
    const applicantFilter = {};

    if (organisation && organisation !== "all") {
      const orgRegex = new RegExp(`^${organisation}$`, "i");
      jobFilter.$or = [
        { organisation: orgRegex },
        {
          $and: [
            {
              $or: [
                { organisation: { $exists: false } },
                { organisation: null },
                { organisation: "" },
              ],
            },
            { company: orgRegex },
          ],
        },
      ];
      applicantFilter.organisation = orgRegex;
    }

    const totalJobs = await Job.countDocuments(jobFilter);
    const totalApplicants = await Applicant.countDocuments(applicantFilter);
    const inInterview = await Applicant.countDocuments({
      ...applicantFilter,
      stage: "Interview",
    });
    return { totalJobs, totalApplicants, inInterview };
  }
}

export default new AtsRepository();
