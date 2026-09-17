import Joi from "joi";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";

export const downloadPayslipSchema = Joi.object({
  id: Joi.string().required().messages(joiCustomMessages).label("Payslip ID"),
});

export const validateDownloadPayslip = (req, res, next) => {
  const { error } = downloadPayslipSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};
