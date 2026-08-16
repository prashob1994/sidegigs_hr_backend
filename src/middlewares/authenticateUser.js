import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate requests using JWT Bearer Token
 */
const authenticateUser = async (req, res, next) => {
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
