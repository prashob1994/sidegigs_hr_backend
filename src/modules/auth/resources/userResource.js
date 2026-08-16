export const userResource = (user) => {
  if (!user) return null;
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    organisation: user.organisation || "sidegigs",
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
};

export const userListResource = (users) => {
  return users.map((user) => userResource(user));
};
