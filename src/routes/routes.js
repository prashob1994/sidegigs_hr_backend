import authRouter from "../modules/auth/routes/authRoutes.js";
import employeeRouter from "../modules/hr/routes/hrRoutes.js";
import employeeAuthRouter from "../modules/employee/auth/routes/employeeAuthRoutes.js";
import leaveRouter from "../modules/leave/routes/leaveRoutes.js";
import attendanceRouter from "../modules/attendance/routes/attendanceRoutes.js";

const configureRoutes = (app) => {
  // Remote HR Authentication Proxy Routes (/api/auth/*)
  app.use("/api/auth", authRouter);

  // Dedicated Employee Auth Route (/api/employee/auth/login)
  app.use("/api/employee/auth", employeeAuthRouter);

  // URL-Scoped Organisation Employee Auth Routes (/api/:organisation/auth/*)
  app.use("/api/:organisation/auth", employeeAuthRouter);

  // URL-Scoped Organisation Employee Management Routes (/api/:organisation/employees/*)
  app.use("/api/:organisation/employees", employeeRouter);

  // URL-Scoped Organisation Leave Application Routes (/api/:organisation/leave/*)
  app.use("/api/:organisation/leave", leaveRouter);

  // URL-Scoped Attendance Routes (/api/:organisation/attendance/*)
  app.use("/api/:organisation/attendance", attendanceRouter);
};

export default configureRoutes;
