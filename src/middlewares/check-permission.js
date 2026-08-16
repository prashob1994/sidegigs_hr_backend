/**
 * Middleware factory for checking permissions
 * @param {string|string[]} requiredPermissions - Required permission string or array of permissions
 */
const checkPermission = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      const userPermissions = req.user?.permissions || [];
      const permissionsArray = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      const hasPermission = permissionsArray.some((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        return res.status(403).json({
          status: false,
          message: "Forbidden: You do not have permission to access this resource",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Internal server error during permission check",
        error: error.message,
      });
    }
  };
};

export default checkPermission;
