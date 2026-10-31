import mongoose from "mongoose";
import atsRepository from "../src/modules/ats/repositories/atsRepository.js";
import Job from "../src/modules/ats/models/jobModel.js";
import Applicant from "../src/modules/ats/models/applicantModel.js";

async function testOrganisationIsolation() {
  console.log("=== Testing Organisation Isolation in ATS Repository ===");

  // Mock Job.find, countDocuments, etc. to test query construction
  let capturedFindQuery = null;
  const originalFind = Job.find;
  Job.find = function (query) {
    capturedFindQuery = query;
    return {
      sort: () => [
        { _id: "1", job_title: "Apple Job", organisation: "apple" },
      ],
    };
  };

  let capturedCountQuery = null;
  const originalCount = Job.countDocuments;
  Job.countDocuments = function (query) {
    capturedCountQuery = query;
    return 1;
  };

  const originalAppCount = Applicant.countDocuments;
  Applicant.countDocuments = function () {
    return 0;
  };

  // Test 1: findJobsByOrganisation for 'apple'
  await atsRepository.findJobsByOrganisation("apple", {});
  console.log("Captured query for apple:", capturedFindQuery);

  const orgRegex = capturedFindQuery.$or[0].organisation;
  if (!(orgRegex instanceof RegExp) || !orgRegex.test("apple") || orgRegex.test("google")) {
    throw new Error("FAILED: Query does not filter by apple regex correctly!");
  }

  // Ensure { company: { $exists: true } } is NOT present in $or
  const hasGlobalCompanyExists = capturedFindQuery.$or.some(
    (cond) => cond.company && cond.company.$exists === true
  );
  if (hasGlobalCompanyExists) {
    throw new Error("FAILED: Query still contains company: { $exists: true }!");
  }
  console.log("✔ Test 1: findJobsByOrganisation properly scopes to organisation without global $exists!");

  // Test 2: getCounts for 'google'
  await atsRepository.getCounts("google");
  console.log("Captured count query for google:", capturedCountQuery);
  const countOrgRegex = capturedCountQuery.$or[0].organisation;
  if (!(countOrgRegex instanceof RegExp) || !countOrgRegex.test("google") || countOrgRegex.test("apple")) {
    throw new Error("FAILED: getCounts does not filter by google!");
  }
  console.log("✔ Test 2: getCounts properly scopes job counts by organisation!");

  // Restore originals
  Job.find = originalFind;
  Job.countDocuments = originalCount;
  Applicant.countDocuments = originalAppCount;

  console.log("🎉 ALL ORGANISATION ISOLATION TESTS PASSED!");
}

testOrganisationIsolation().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
