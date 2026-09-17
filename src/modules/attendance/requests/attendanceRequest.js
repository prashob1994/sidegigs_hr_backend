import Joi from "joi";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";

export const clockInSchema = Joi.object({
  locationType: Joi.string()
    .valid("Office HQ", "Remote WFH", "Client Site")
    .optional()
    .default("Office HQ")
    .messages(joiCustomMessages)
    .label("Shift Location"),
  shiftNotes: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Shift Notes"),
  employeeId: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Employee ID"),
  employeeName: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Employee Name"),
});

export const validateClockIn = (req, res, next) => {
  const { error } = clockInSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

export const exportCsvSchema = Joi.object({
  startDate: Joi.string().isoDate().optional().allow("", null).messages(joiCustomMessages).label("Start Date"),
  endDate: Joi.string().isoDate().optional().allow("", null).messages(joiCustomMessages).label("End Date"),
  status: Joi.string().optional().allow("", null).messages(joiCustomMessages).label("Status"),
});

export const validateExportCsv = (req, res, next) => {
  const { error } = exportCsvSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};
