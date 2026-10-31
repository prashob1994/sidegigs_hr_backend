import { deleteJobSchema, changeStatusSchema } from "../src/modules/ats/requests/atsRequest.js";

async function testDeleteAndStatusValidation() {
  console.log("=== Testing Delete Job and Change Status Requests in HR ATS ===");

  // 1. Delete job validation with string id
  const d1 = deleteJobSchema.validate({ id: "64e0a1b2c3d4e5f678901234" });
  if (d1.error) throw new Error("deleteJobSchema failed for string id: " + d1.error.message);
  console.log("✔ deleteJobSchema validates string id");

  // 2. Delete job validation with job_id and key_id
  const d2 = deleteJobSchema.validate({ job_id: "JOB-999", key_id: 105 });
  if (d2.error) throw new Error("deleteJobSchema failed for job_id/key_id: " + d2.error.message);
  console.log("✔ deleteJobSchema validates job_id and key_id");

  // 3. Delete job fails without any identifier
  const d3 = deleteJobSchema.validate({});
  if (!d3.error) throw new Error("deleteJobSchema should fail without identifier");
  console.log("✔ deleteJobSchema correctly fails without identifier");

  // 4. Change status validation with 'accepted'
  const s1 = changeStatusSchema.validate({ id: "101", status: "accepted" });
  if (s1.error) throw new Error("changeStatusSchema failed for accepted: " + s1.error.message);
  if (s1.value.status !== "accepted") throw new Error("Expected status 'accepted'");
  console.log("✔ changeStatusSchema accepts status 'accepted'");

  // 5. Change status validation with 'rejected'
  const s2 = changeStatusSchema.validate({ job_id: 101, status: "rejected" });
  if (s2.error) throw new Error("changeStatusSchema failed for rejected: " + s2.error.message);
  if (s2.value.status !== "rejected") throw new Error("Expected status 'rejected'");
  console.log("✔ changeStatusSchema accepts status 'rejected'");

  // 6. Change status validation with default 'pending'
  const s3 = changeStatusSchema.validate({ id: "101" });
  if (s3.error) throw new Error("changeStatusSchema failed without status: " + s3.error.message);
  if (s3.value.status !== "pending") throw new Error("Expected default status 'pending'");
  console.log("✔ changeStatusSchema defaults status to 'pending'");

  // 7. Change status validation fails for invalid status
  const s4 = changeStatusSchema.validate({ id: "101", status: "invalid_status" });
  if (!s4.error) throw new Error("changeStatusSchema should fail for invalid status");
  console.log("✔ changeStatusSchema correctly rejects invalid status");

  console.log("🎉 ALL HR ATS VALIDATION TESTS PASSED!");
}

testDeleteAndStatusValidation().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
