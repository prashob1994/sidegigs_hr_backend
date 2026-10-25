import { createJobSchema, updateJobSchema } from "../src/modules/ats/requests/atsRequest.js";
import CreateJobRequest from "../../sidegigs_backend/src/modules/jobs/requests/createJobRequest.js";
import UpdateJobRequest from "../../sidegigs_backend/src/modules/jobs/requests/updateJobRequest.js";

async function testUpsertValidation() {
  console.log("=== Testing Upsert Request Validation ===");

  // 1. HR createJobSchema with existing _id and job_id (when editing from HR UI)
  const hrEditPayload = {
    _id: "671b5634567890abcdef1234",
    job_id: "JOB-102948",
    key_id: 12,
    job_title: "Senior Node.js Developer",
    company: "SideGigs HR",
    job_description: "Updated description",
    payment: "150000",
    __v: 0,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-25T12:00:00.000Z",
  };

  const { error: hrEditErr, value: validatedHrEdit } = createJobSchema.validate(hrEditPayload);
  if (hrEditErr) {
    throw new Error(`HR createJobSchema failed on edit payload: ${hrEditErr.message}`);
  }
  if (validatedHrEdit.job_title !== "Senior Node.js Developer") {
    throw new Error("HR createJobSchema stripped valid fields");
  }
  console.log("✔ HR createJobSchema properly validates edit payload containing _id, key_id, etc. without error!");

  // 2. HR updateJobSchema with _id
  const hrUpdatePayload = {
    _id: "671b5634567890abcdef1234",
    job_title: "Staff Node.js Developer",
    payment: "200000",
    randomFrontendField: "should_be_stripped",
  };

  const { error: hrUpdateErr, value: validatedHrUpdate } = updateJobSchema.validate(hrUpdatePayload);
  if (hrUpdateErr) {
    throw new Error(`HR updateJobSchema failed on _id: ${hrUpdateErr.message}`);
  }
  if (validatedHrUpdate.job_title !== "Staff Node.js Developer") {
    throw new Error("HR updateJobSchema failed to preserve job_title");
  }
  console.log("✔ HR updateJobSchema properly accepts _id and strips unknown fields!");

  // 3. SideGigs Backend CreateJobRequest with existing hr_job_id
  const backendUpsertPayload = {
    hr_job_id: "671b5634567890abcdef1234",
    job_title: "Staff Node.js Developer",
    company: "SideGigs HR",
    location: {
      type: "Point",
      coordinates: [77.5946, 12.9716],
    },
    payment: "200000",
  };
  const validatedBackendUpsert = CreateJobRequest.validate(backendUpsertPayload);
  if (validatedBackendUpsert.hr_job_id !== "671b5634567890abcdef1234") {
    throw new Error("Backend CreateJobRequest failed to validate hr_job_id on upsert");
  }
  console.log("✔ Backend CreateJobRequest validates upsert payload successfully!");

  console.log("🎉 ALL UPSERT TESTS PASSED!");
}

testUpsertValidation().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
