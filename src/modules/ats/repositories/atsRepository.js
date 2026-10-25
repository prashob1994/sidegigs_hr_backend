import mongoose from "mongoose";
import Job from "../models/jobModel.js";
import Applicant from "../models/applicantModel.js";
import UserJob from "../models/userJobModel.js";
import User from "../../auth/models/userModel.js";

class AtsRepository {
  async findJobsByOrganisation(organisation, filter = {}) {
    const query = { ...filter };
    if (organisation && organisation !== "all") {
      query.$or = [
        { organisation: new RegExp(`^${organisation}$`, "i") },
        { company: new RegExp(organisation, "i") },
        { company: { $exists: true } },
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
    return await Applicant.find({ organisation, ...filter })
      .populate("jobId", "job_title company category")
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
    const totalJobs = await Job.countDocuments({ status: "open" });
    const totalApplicants = await Applicant.countDocuments({ organisation });
    const inInterview = await Applicant.countDocuments({ organisation, stage: "Interview" });
    return { totalJobs, totalApplicants, inInterview };
  }
}

export default new AtsRepository();
