import Job from "../models/jobModel.js";
import Applicant from "../models/applicantModel.js";

class AtsRepository {
  async findJobsByOrganisation(organisation, filter = {}) {
    return await Job.find({ organisation, ...filter }).sort({ createdAt: -1 });
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
      .populate("jobId", "title department")
      .sort({ createdAt: -1 });
  }

  async createApplicant(data) {
    const applicant = await Applicant.create(data);
    if (data.jobId) {
      await Job.findByIdAndUpdate(data.jobId, { $inc: { applicantsCount: 1 } });
    }
    return applicant;
  }

  async updateApplicantStage(id, stage) {
    return await Applicant.findByIdAndUpdate(id, { stage }, { new: true });
  }

  async getCounts(organisation) {
    const totalJobs = await Job.countDocuments({ organisation, status: "active" });
    const totalApplicants = await Applicant.countDocuments({ organisation });
    const inInterview = await Applicant.countDocuments({ organisation, stage: "Interview" });
    return { totalJobs, totalApplicants, inInterview };
  }
}

export default new AtsRepository();
