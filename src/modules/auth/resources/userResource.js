export const userResource = (user) => {
  if (!user) return null;
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    phone_number: user.phone_number || null,
    is_company: Boolean(user.is_company),
    is_individual: Boolean(user.is_individual),
    business_name: user.business_name || null,
    business_type: user.business_type || null,
    location_text: user.location_text || null,
    location: user.location || { type: "Point", coordinates: [0, 0] },
    is_hire_works: Boolean(user.is_hire_works),
    is_manage_attendance: Boolean(user.is_manage_attendance),
    is_manage_jobs: Boolean(user.is_manage_jobs),
    is_find_temporary_works: Boolean(user.is_find_temporary_works),
    organisation: user.organisation || user.business_name || "sidegigs",
    role: user.role || "hr",
    status: user.status || "active",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const userListResource = (users) => {
  return users.map((user) => userResource(user));
};
