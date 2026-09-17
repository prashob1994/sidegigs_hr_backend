import Joi from "joi";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";

export const leaveActionSchema = Joi.object({
  id: Joi.string().required().messages(joiCustomMessages).label("Leave Request ID"),
  rejectionReason: Joi.string().optional().allow("", null).messages(joiCustomMessages).label("Rejection Reason"),
});

export const validateLeaveAction = (req, res, next) => {
  const { error } = leaveActionSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};
