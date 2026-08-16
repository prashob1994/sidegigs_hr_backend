import Joi from "joi";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages(joiCustomMessages).label("Name"),
  email: Joi.string().email().required().messages(joiCustomMessages).label("Email"),
  password: Joi.string().min(8).required().messages(joiCustomMessages).label("Password"),
  role: Joi.string().valid("admin", "hr", "employee", "user").optional().messages(joiCustomMessages).label("Role"),
});

export const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};
