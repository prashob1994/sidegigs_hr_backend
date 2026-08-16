import jwt from "jsonwebtoken";

/**
 * Generates a JSON Web Token (JWT) for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} expiresIn - Expiration duration (default '30d').
 * @returns {string} The generated JWT token.
 */
const generateToken = (userId, expiresIn = "30d") => {
  const secret = process.env.JWT_SECRET || "sidgigs_hr_jwt_secret_key_change_in_production";
  return jwt.sign({ userId }, secret, { expiresIn });
};

export default generateToken;
