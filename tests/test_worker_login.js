import Employee from "../src/modules/hr/models/employeeModel.js";
import userRepository from "../src/modules/auth/repositories/userRepository.js";
import { employeeLogin } from "../src/modules/employee/auth/controllers/employeeAuthController.js";
import { emailLogin } from "../src/modules/auth/controllers/authController.js";
import { hashPassword } from "../src/utils/bcryptPassword.js";

async function runWorkerLoginTests() {
  console.log("=== Testing Worker Password Authentication ===");

  // Test 1: Verify Employee schema has password field
  const employeeSchemaPaths = Object.keys(Employee.schema.paths);
  if (!employeeSchemaPaths.includes("password")) {
    throw new Error("Test 1 Failed: 'password' field missing from Employee schema!");
  }
  console.log("✔ Test 1: 'password' field successfully defined in Employee model");

  // Mock res helper
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

  // Mock employee document with password set
  const correctPassword = "StrongPassword@123";
  const hashedPassword = await hashPassword(correctPassword);

  const mockEmployeeWithPassword = {
    _id: "64e0a1b2c3d4e5f678909999",
    name: "John Worker",
    email: "worker@example.com",
    employeeCode: "EMP-101",
    organisation: "sidegigs",
    status: "active",
    password: hashedPassword,
    save: async function () {},
  };

  const mockEmployeeWithoutPassword = {
    _id: "64e0a1b2c3d4e5f678908888",
    name: "Unset Password Worker",
    email: "nopass@example.com",
    employeeCode: "EMP-102",
    organisation: "sidegigs",
    status: "active",
    password: null,
    save: async function () {},
  };

  // Override Employee.findOne and userRepository.findByEmail for testing
  const originalFindOne = Employee.findOne;
  const originalFindByEmail = userRepository.findByEmail;
  userRepository.findByEmail = async () => null;

  try {
    // Test 2: Reject login if employee has no password set (cannot login with random password)
    Employee.findOne = async () => mockEmployeeWithoutPassword;
    const req2 = {
      body: {
        username: "nopass@example.com",
        password: "AnyRandomPassword123",
      },
      params: {},
    };
    const res2 = createMockRes();
    await employeeLogin(req2, res2);

    if (res2.statusCode !== 401 || res2.responseData.status !== false) {
      throw new Error(`Test 2 Failed: Expected 401, got ${res2.statusCode}: ${JSON.stringify(res2.responseData)}`);
    }
    console.log("✔ Test 2: Employee with no password set is rejected with 401 (cannot login with any password)");

    // Test 3: Reject login with wrong password
    Employee.findOne = async () => mockEmployeeWithPassword;
    const req3 = {
      body: {
        username: "worker@example.com",
        password: "WrongPassword!",
      },
      params: {},
    };
    const res3 = createMockRes();
    await employeeLogin(req3, res3);

    if (res3.statusCode !== 401 || res3.responseData.status !== false) {
      throw new Error(`Test 3 Failed: Wrong password was accepted! Status ${res3.statusCode}`);
    }
    console.log("✔ Test 3: Login with incorrect password is correctly rejected with 401");

    // Test 4: Allow login with correct password
    const req4 = {
      body: {
        username: "worker@example.com",
        password: correctPassword,
      },
      params: {},
    };
    const res4 = createMockRes();
    await employeeLogin(req4, res4);

    if (res4.statusCode !== 200 || !res4.responseData.data?.token) {
      throw new Error(`Test 4 Failed: Correct password failed! Status ${res4.statusCode}: ${JSON.stringify(res4.responseData)}`);
    }
    console.log("✔ Test 4: Login with correct password succeeds and returns JWT token");

    // Test 5: Verify emailLogin in authController also checks worker password correctly
    const req5Wrong = {
      body: {
        email: "worker@example.com",
        password: "WrongPassword999",
      },
    };
    const res5Wrong = createMockRes();
    await emailLogin(req5Wrong, res5Wrong);

    if (res5Wrong.statusCode !== 401) {
      throw new Error(`Test 5 Failed: emailLogin accepted wrong password! Status ${res5Wrong.statusCode}`);
    }
    console.log("✔ Test 5: emailLogin correctly rejects wrong password for worker");

    const req5Correct = {
      body: {
        email: "worker@example.com",
        password: correctPassword,
      },
    };
    const res5Correct = createMockRes();
    await emailLogin(req5Correct, res5Correct);

    if (res5Correct.statusCode !== 200 || res5Correct.responseData.data?.user_type !== "worker") {
      throw new Error(`Test 5b Failed: emailLogin failed for worker! Status ${res5Correct.statusCode}: ${JSON.stringify(res5Correct.responseData)}`);
    }
    console.log("✔ Test 5b: emailLogin correctly authenticates worker with valid password");

  } finally {
    Employee.findOne = originalFindOne;
    userRepository.findByEmail = originalFindByEmail;
  }

  console.log("🎉 ALL WORKER LOGIN AUTHENTICATION TESTS PASSED!");
}

runWorkerLoginTests().catch((err) => {
  console.error("Worker login test failed:", err);
  process.exit(1);
});
