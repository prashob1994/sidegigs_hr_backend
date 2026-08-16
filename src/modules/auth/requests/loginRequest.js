import Joi from "joi";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages(joiCustomMessages).label("Email"),
  password: Joi.string().required().messages(joiCustomMessages).label("Password"),
});

export const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};
