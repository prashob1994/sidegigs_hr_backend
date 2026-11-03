import User from "../src/modules/auth/models/userModel.js";
import { userResource } from "../src/modules/auth/resources/userResource.js";
import { updateVerification } from "../src/modules/auth/controllers/authController.js";
import { verificationSchema } from "../src/modules/auth/requests/verificationRequest.js";
import generateToken from "../src/utils/generateToken.js";

async function runVerificationTests() {
  console.log("=== Testing HR User Verification API & Schema ===");

  // Test 1: Check User schema has is_verified and verified_detail
  const schemaPaths = Object.keys(User.schema.paths);
  if (!schemaPaths.includes("is_verified")) {
    throw new Error("Test 1 Failed: is_verified field missing from User model!");
  }
  if (!schemaPaths.includes("verified_detail")) {
    throw new Error("Test 1 Failed: verified_detail field missing from User model!");
  }
  console.log("✔ Test 1: is_verified and verified_detail fields exist in User schema");

  // Test 2: Check default values
  const defaultUser = new User({
    name: "Default Test User",
    email: "default@test.com",
    password: "Password123!",
  });
  if (defaultUser.is_verified !== false) {
    throw new Error(`Test 2 Failed: Expected is_verified default to be false, got ${defaultUser.is_verified}`);
  }
  if (defaultUser.verified_detail !== null && defaultUser.verified_detail !== undefined) {
    throw new Error(`Test 2 Failed: Expected verified_detail default to be null, got ${defaultUser.verified_detail}`);
  }
  console.log("✔ Test 2: is_verified defaults to false and verified_detail defaults to null");

  // Test 3: userResource formats is_verified and verified_detail
  const formattedDefault = userResource(defaultUser);
  if (formattedDefault.is_verified !== false || formattedDefault.verified_detail !== null) {
    throw new Error("Test 3 Failed: userResource did not output verification fields properly");
  }
  console.log("✔ Test 3: userResource includes is_verified and verified_detail");

  // Mock response helper
  const createMockRes = () => {
    const res = {
      statusCode: null,
      responseData: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.responseData = data;
        return this;
      },
    };
    return res;
  };

  // Mock user instance
  const mockUser = {
    _id: "64e0a1b2c3d4e5f678901111",
    name: "HR Manager",
    email: "hr.manager@sidegigs.com",
    is_verified: false,
    verified_detail: null,
    save: async function () {},
  };

  const originalFindById = User.findById;
  const originalFindOne = User.findOne;

  try {
    User.findById = async (id) => (String(id) === String(mockUser._id) ? mockUser : null);
    User.findOne = async (query) => (query?.email === mockUser.email ? mockUser : null);

    // Test 4: updateVerification with text verified_detail and is_verified: true
    const req4 = {
      headers: {},
      body: {
        id: String(mockUser._id),
        is_verified: true,
        verified_detail: "Aadhaar Card Verified by Admin",
      },
    };
    const res4 = createMockRes();
    await updateVerification(req4, res4);

    if (res4.statusCode !== 200 || !res4.responseData.status) {
      throw new Error(`Test 4 Failed: Expected 200, got ${res4.statusCode}: ${JSON.stringify(res4.responseData)}`);
    }
    if (mockUser.is_verified !== true || mockUser.verified_detail !== "Aadhaar Card Verified by Admin") {
      throw new Error("Test 4 Failed: mockUser fields not updated with text detail");
    }
    console.log("✔ Test 4: updateVerification successfully stores text verified_detail and sets is_verified to true");

    // Test 5: updateVerification with JSON object verified_detail and 'is_verifed' spelling
    const jsonDetail = {
      doc_type: "PAN",
      pan_number: "ABCDE1234F",
      verified_at: "2026-11-03T18:00:00Z",
      source: "Govt Portal Webhook",
    };
    const req5 = {
      headers: {},
      body: {
        email: mockUser.email,
        is_verifed: true, // testing user's alternative spelling
        verified_detail: jsonDetail,
      },
    };
    const res5 = createMockRes();
    await updateVerification(req5, res5);

    if (res5.statusCode !== 200 || !res5.responseData.status) {
      throw new Error(`Test 5 Failed: Expected 200, got ${res5.statusCode}: ${JSON.stringify(res5.responseData)}`);
    }
    if (mockUser.is_verified !== true || mockUser.verified_detail.doc_type !== "PAN") {
      throw new Error("Test 5 Failed: mockUser fields not updated with JSON object");
    }
    console.log("✔ Test 5: updateVerification successfully stores JSON object and handles 'is_verifed' spelling");

    // Test 6: updateVerification with JSON string that gets parsed
    const req6 = {
      headers: {},
      body: {
        email: mockUser.email,
        is_verified: false,
        verified_detail: JSON.stringify({ reason: "Expired document", recheck: true }),
      },
    };
    const res6 = createMockRes();
    await updateVerification(req6, res6);

    if (res6.statusCode !== 200) {
      throw new Error(`Test 6 Failed: Expected 200, got ${res6.statusCode}`);
    }
    if (mockUser.is_verified !== false || mockUser.verified_detail.reason !== "Expired document") {
      throw new Error("Test 6 Failed: JSON string parsing failed");
    }
    console.log("✔ Test 6: updateVerification parses JSON string into object when applicable");

    // Test 7: updateVerification via Bearer token
    const token = generateToken(mockUser._id);
    const req7 = {
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        is_verified: true,
        verified_detail: "Verified via authenticated session",
      },
    };
    const res7 = createMockRes();
    await updateVerification(req7, res7);

    if (res7.statusCode !== 200) {
      throw new Error(`Test 7 Failed: Expected 200, got ${res7.statusCode}`);
    }
    if (mockUser.is_verified !== true) {
      throw new Error("Test 7 Failed: Token authentication verification failed");
    }
    console.log("✔ Test 7: updateVerification works seamlessly with Bearer JWT token");

    // Test 8: verificationSchema validation
    const v1 = verificationSchema.validate({
      is_verified: true,
      verified_detail: { sample: "json" },
    });
    if (v1.error) throw new Error("Test 8 Failed: verificationSchema failed for JSON");

    const v2 = verificationSchema.validate({
      is_verifed: "true",
      verified_detail: "sample text",
    });
    if (v2.error) throw new Error("Test 8 Failed: verificationSchema failed for string");
    console.log("✔ Test 8: verificationSchema passes for both text and JSON");

  } finally {
    User.findById = originalFindById;
    User.findOne = originalFindOne;
  }

  console.log("🎉 ALL HR USER VERIFICATION TESTS PASSED!");
}

runVerificationTests().catch((err) => {
  console.error("Verification test failed:", err);
  process.exit(1);
});
