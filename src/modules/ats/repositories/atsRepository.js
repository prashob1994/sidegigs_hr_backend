import Job from "../models/jobModel.js";
import Applicant from "../models/applicantModel.js";
import UserJob from "../models/userJobModel.js";
import User from "../../auth/models/userModel.js";

class AtsRepository {
  async findJobsByOrganisation(organisation, filter = {}) {
    const query = { ...filter };
    if (organisation && organisation !== "all") {
      query.$or = [{ company: new RegExp(organisation, "i") }, { company: { $exists: true } }];
    }
    return await Job.find(query).sort({ createdAt: -1 });
  }

  async createJob(data) {
    return await Job.create(data);
  }

  async findJobById(id) {
    return await Job.findById(id);
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
