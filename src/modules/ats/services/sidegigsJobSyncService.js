import axios from "axios";

const getJobsBaseUrl = () => {
  if (process.env.SIDEGIGS_JOBS_API_URL) {
    return process.env.SIDEGIGS_JOBS_API_URL;
  }
  const mainApi = process.env.SIDEGIGS_API_URL || "http://localhost:3001/api";
  return `${mainApi}/jobs`;
};

class SidegigsJobSyncService {
  /**
   * Sync newly created HR job to sidegigs_backend /api/jobs/create
   * @param {Object} jobData
   * @param {Object} hrJob
   * @param {Object} incomingHeaders
   */
  async createJobInSidegigsBackend(jobData, hrJob, incomingHeaders = {}) {
    const url = `${getJobsBaseUrl()}/create`;
    const serviceKey = process.env.INTERNAL_SERVICE_KEY || "sidegigs_hr_secret_key";

    const payload = {
      job_title: jobData.job_title,
      company: jobData.company,
      job_description: jobData.job_description,
      payment: jobData.payment,
      payment_type: jobData.payment_type,
      job_requirements: jobData.job_requirements,
      location_text: jobData.location_text,
      location: jobData.location,
      start_date: jobData.start_date,
      end_date: jobData.end_date,
      start_time: jobData.start_time,
      end_time: jobData.end_time,
      status: jobData.status || "open",
      category: jobData.category,
      phone_number: jobData.phone_number,
      collect_phone: jobData.collect_phone,
      collect_resume: jobData.collect_resume,
      logo: jobData.logo,
      created_by: jobData.created_by,
      hr_job_id: String(hrJob._id),
      job_id: hrJob.job_id,
    };

    const headers = {
      "Content-Type": "application/json",
      "x-service-key": serviceKey,
      "x-from-hr-sync": "true",
      ...(incomingHeaders.authorization && {
        authorization: incomingHeaders.authorization,
      }),
    };

    try {
      const response = await axios.post(url, payload, {
        headers,
        timeout: 10000,
      });

      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      console.warn(`[SidegigsJobSyncService] Failed to create job in sidegigs_backend: ${error.message}`);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status || 500,
      };
    }
  }

  /**
   * Sync updated HR job to sidegigs_backend /api/jobs/update
   * @param {Object} hrJob
   * @param {Object} updateData
   * @param {Object} incomingHeaders
   */
  async updateJobInSidegigsBackend(hrJob, updateData, incomingHeaders = {}) {
    const url = `${getJobsBaseUrl()}/update`;
    const serviceKey = process.env.INTERNAL_SERVICE_KEY || "sidegigs_hr_secret_key";

    const payload = {
      hr_job_id: String(hrJob._id),
      ...(hrJob.sidegigs_key_id && { key_id: hrJob.sidegigs_key_id }),
      ...(updateData.job_title !== undefined && { job_title: updateData.job_title }),
      ...(updateData.company !== undefined && { company: updateData.company }),
      ...(updateData.job_description !== undefined && { job_description: updateData.job_description }),
      ...(updateData.payment !== undefined && { payment: updateData.payment }),
      ...(updateData.payment_type !== undefined && { payment_type: updateData.payment_type }),
      ...(updateData.job_requirements !== undefined && { job_requirements: updateData.job_requirements }),
      ...(updateData.location_text !== undefined && { location_text: updateData.location_text }),
      ...(updateData.location !== undefined && { location: updateData.location }),
      ...(updateData.start_date !== undefined && { start_date: updateData.start_date }),
      ...(updateData.end_date !== undefined && { end_date: updateData.end_date }),
      ...(updateData.start_time !== undefined && { start_time: updateData.start_time }),
      ...(updateData.end_time !== undefined && { end_time: updateData.end_time }),
      ...(updateData.status !== undefined && { status: updateData.status }),
      ...(updateData.category !== undefined && { category: updateData.category }),
      ...(updateData.phone_number !== undefined && { phone_number: updateData.phone_number }),
      ...(updateData.collect_phone !== undefined && { collect_phone: updateData.collect_phone }),
      ...(updateData.collect_resume !== undefined && { collect_resume: updateData.collect_resume }),
      ...(updateData.logo !== undefined && { logo: updateData.logo }),
    };

    const headers = {
      "Content-Type": "application/json",
      "x-service-key": serviceKey,
      "x-from-hr-sync": "true",
      ...(incomingHeaders.authorization && {
        authorization: incomingHeaders.authorization,
      }),
    };

    try {
      const response = await axios.post(url, payload, {
        headers,
        timeout: 10000,
      });

      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      console.warn(`[SidegigsJobSyncService] Failed to update job in sidegigs_backend: ${error.message}`);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status || 500,
      };
    }
  }
}

export default new SidegigsJobSyncService();
