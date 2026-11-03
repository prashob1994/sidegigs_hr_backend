import Joi from "joi";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";

export const verificationSchema = Joi.object({
  id: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("User ID"),
  userId: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("User ID"),
  user_id: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("User ID"),
  email: Joi.string().email().allow("", null).optional().messages(joiCustomMessages).label("Email"),
  is_verified: Joi.alternatives()
    .try(Joi.boolean(), Joi.string(), Joi.number())
    .optional()
    .messages(joiCustomMessages)
    .label("Is Verified"),
  is_verifed: Joi.alternatives()
    .try(Joi.boolean(), Joi.string(), Joi.number())
    .optional()
    .messages(joiCustomMessages)
    .label("Is Verified"),
  verified_detail: Joi.any().optional().messages(joiCustomMessages).label("Verified Detail"),
  verifiedDetail: Joi.any().optional().messages(joiCustomMessages).label("Verified Detail"),
}).options({ abortEarly: false, stripUnknown: true });

export const validateVerification = (req, res, next) => {
  const { error } = verificationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

export default {
  verificationSchema,
  validateVerification,
};
