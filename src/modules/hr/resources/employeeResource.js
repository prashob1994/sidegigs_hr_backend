export const employeeResource = (emp) => {
  if (!emp) return null;
  const name = emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "EM";

  const attRate = emp.attendanceRate !== undefined ? emp.attendanceRate : 95;

  return {
    id: emp._id || emp.id,
    employeeCode: emp.employeeCode || "",
    name,
    initials,
    email: emp.email || null,
    phone: emp.phone || null,
    organisation: emp.organisation || "",
    department: emp.department || "General",
    designation: emp.designation || "Employee",
    joiningDate: emp.joiningDate,
    salary: emp.salary || 0,
    status: emp.status || "active",
    reportsTo: emp.reportsTo || null,
    avatar: emp.avatar || null,
    workplaceType: emp.workplaceType || "On-Site",
    attendanceRate: `${attRate}% Attendance`,
    rawAttendanceRate: attRate,
    createdAt: emp.createdAt,
  };
};

export const employeeListResource = (employees) => {
  return employees.map((emp) => employeeResource(emp));
};
