import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate requests using JWT Bearer Token or internal service key
 */
const authenticateUser = async (req, res, next) => {
  // Allow inter-service communication between SideGigs Backend and SideGigs HR Backend
  const configuredKey = process.env.INTERNAL_SERVICE_KEY ? process.env.INTERNAL_SERVICE_KEY.trim() : null;
  const allowedKeys = new Set([
    "sidegigs_hr_secret_key",
    "sidegigs_hr_backend",
    ...(configuredKey ? [configuredKey] : []),
  ]);

  const authHeader = req.headers["authorization"] || req.headers["Authorization"] || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1]?.trim() : null;

  const rawServiceKey =
    req.headers["x-service-key"] ||
    req.headers["x-internal-secret"] ||
    req.headers["x-api-key"] ||
    bearerToken ||
    req.query?.service_key ||
    req.body?.service_key;

  const serviceKey = rawServiceKey ? String(rawServiceKey).trim() : null;

  if (serviceKey && allowedKeys.has(serviceKey)) {
    req.user = {
      is_service: true,
      organisation: req.params.organisation || "sidegigs",
      key_id: 1,
    };
    return next();
  }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const secret = process.env.JWT_SECRET || "sidgigs_hr_jwt_secret_key_change_in_production";
      const decoded = jwt.verify(token, secret);

      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: "Not authorized, token failed validation",
        error: error.message,
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Not authorized, no bearer token provided",
    });
  }
};

export default authenticateUser;
