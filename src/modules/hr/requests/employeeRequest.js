import Joi from "joi";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";

export const createEmployeeSchema = Joi.object({
  name: Joi.string().required().messages(joiCustomMessages).label("Employee Name"),
  email: Joi.string().email().allow("", null).optional().messages(joiCustomMessages).label("Email"),
  phone: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Phone Number"),
  organisation: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Organisation"),
  employeeCode: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Employee Code"),
  department: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Department"),
  designation: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Designation"),
  salary: Joi.number().optional().messages(joiCustomMessages).label("Salary"),
  status: Joi.string().valid("active", "inactive", "on_leave", "terminated").optional().messages(joiCustomMessages).label("Status"),
  reportsTo: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Reports To Manager ID"),
  workplaceType: Joi.string().valid("On-Site", "Remote", "Hybrid").optional().messages(joiCustomMessages).label("Workplace Type"),
  avatar: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Avatar"),
});

export const validateCreateEmployee = (req, res, next) => {
  const { error } = createEmployeeSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};
