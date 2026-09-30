import Joi from "joi";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages(joiCustomMessages).label("Name"),
  email: Joi.string().email().required().messages(joiCustomMessages).label("Email"),
  password: Joi.string().min(6).required().messages(joiCustomMessages).label("Password"),
  phone_number: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Phone Number"),
  is_company: Joi.boolean().optional().default(false).messages(joiCustomMessages).label("Is Company"),
  is_individual: Joi.boolean().optional().default(false).messages(joiCustomMessages).label("Is Individual"),
  business_name: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Business Name"),
  business_type: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Business Type"),
  location_text: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Location Text"),
  location: Joi.object({
    type: Joi.string().valid("Point").default("Point").messages(joiCustomMessages).label("Location Type"),
    coordinates: Joi.array()
      .items(Joi.number())
      .length(2)
      .optional()
      .messages(joiCustomMessages)
      .label("Location Coordinates"),
  })
    .optional()
    .messages(joiCustomMessages)
    .label("Location"),
  is_hire_works: Joi.boolean().optional().default(false).messages(joiCustomMessages).label("Is Hire Works"),
  is_manage_attendance: Joi.boolean().optional().default(false).messages(joiCustomMessages).label("Is Manage Attendance"),
  is_manage_jobs: Joi.boolean().optional().default(false).messages(joiCustomMessages).label("Is Manage Jobs"),
  is_find_temporary_works: Joi.boolean().optional().default(false).messages(joiCustomMessages).label("Is Find Temporary Works"),
  organisation: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Organisation"),
  role: Joi.string().valid("admin", "hr", "employee", "user").optional().default("hr").messages(joiCustomMessages).label("Role"),
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
