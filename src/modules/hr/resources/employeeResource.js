export const employeeResource = (emp) => {
  if (!emp) return null;
  return {
    id: emp._id || emp.id,
    employeeCode: emp.employeeCode || "",
    name: emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
    email: emp.email || null,
    phone: emp.phone || null,
    organisation: emp.organisation || "",
    department: emp.department || "General",
    designation: emp.designation || "Employee",
    joiningDate: emp.joiningDate,
    salary: emp.salary || 0,
    status: emp.status || "active",
    createdAt: emp.createdAt,
  };
};

export const employeeListResource = (employees) => {
  return employees.map((emp) => employeeResource(emp));
};
