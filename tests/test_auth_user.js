import authenticateUser from "../src/middlewares/authenticateUser.js";

async function testAuthUser() {
  console.log("=== Testing authenticateUser Middleware in HR ATS ===");

  // Test 1: Authenticate using x-service-key
  let nextCalled1 = false;
  const req1 = {
    headers: {
      "x-service-key": "sidegigs_hr_secret_key",
    },
    params: { organisation: "sidegigs" },
  };
  const res1 = {
    status: (code) => ({
      json: (data) => {
        throw new Error(`Test 1 unexpected status ${code}: ${JSON.stringify(data)}`);
      },
    }),
  };
  await authenticateUser(req1, res1, () => {
    nextCalled1 = true;
  });
  if (!nextCalled1 || !req1.user?.is_service) {
    throw new Error("Test 1 failed: x-service-key did not authenticate in HR");
  }
  console.log("✔ Test 1: x-service-key authenticated successfully in HR");

  // Test 2: Authenticate using Authorization: Bearer <service_key>
  let nextCalled2 = false;
  const req2 = {
    headers: {
      authorization: "Bearer sidegigs_hr_secret_key",
    },
    params: { organisation: "sidegigs" },
  };
  const res2 = {
    status: (code) => ({
      json: (data) => {
        throw new Error(`Test 2 unexpected status ${code}: ${JSON.stringify(data)}`);
      },
    }),
  };
  await authenticateUser(req2, res2, () => {
    nextCalled2 = true;
  });
  if (!nextCalled2 || !req2.user?.is_service) {
    throw new Error("Test 2 failed: Bearer service_key did not authenticate in HR");
  }
  console.log("✔ Test 2: Authorization Bearer <service_key> authenticated successfully in HR");

  console.log("🎉 ALL HR AUTH TESTS PASSED!");
}

testAuthUser().catch((err) => {
  console.error("HR Auth test failed:", err);
  process.exit(1);
});
