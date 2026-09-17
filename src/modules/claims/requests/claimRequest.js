import Joi from "joi";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";

export const createClaimSchema = Joi.object({
  title: Joi.string().required().messages(joiCustomMessages).label("Claim Title"),
  description: Joi.string().optional().allow("", null).messages(joiCustomMessages).label("Description"),
  category: Joi.string().optional().default("Travel & Fuel").messages(joiCustomMessages).label("Category"),
  amount: Joi.number().greater(0).required().messages(joiCustomMessages).label("Amount"),
});

export const validateCreateClaim = (req, res, next) => {
  const { error } = createClaimSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

export const claimActionSchema = Joi.object({
  id: Joi.string().required().messages(joiCustomMessages).label("Claim ID"),
  rejectionReason: Joi.string().optional().allow("", null).messages(joiCustomMessages).label("Rejection Reason"),
});

export const validateClaimAction = (req, res, next) => {
  const { error } = claimActionSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};
