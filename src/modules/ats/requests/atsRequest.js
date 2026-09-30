import Joi from "joi";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";

export const createJobSchema = Joi.object({
  job_id: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Job ID"),
  job_title: Joi.string().required().messages(joiCustomMessages).label("Job Title"),
  company: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Company"),
  job_description: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Job Description"),
  payment: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Payment"),
  payment_type: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Payment Type"),
  job_requirements: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Job Requirements"),
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
  start_date: Joi.date().iso().allow("", null).optional().messages(joiCustomMessages).label("Start Date"),
  end_date: Joi.date().iso().allow("", null).optional().messages(joiCustomMessages).label("End Date"),
  start_time: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Start Time"),
  end_time: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("End Time"),
  created_by: Joi.number().optional().messages(joiCustomMessages).label("Created By"),
  status: Joi.string().valid("open", "closed").optional().default("open").messages(joiCustomMessages).label("Status"),
  category: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Category"),
  phone_number: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Phone Number"),
  is_verified: Joi.boolean().optional().default(false).messages(joiCustomMessages).label("Is Verified"),
  collect_phone: Joi.boolean().optional().default(false).messages(joiCustomMessages).label("Collect Phone"),
  collect_resume: Joi.boolean().optional().default(false).messages(joiCustomMessages).label("Collect Resume"),
  logo: Joi.string().allow("", null).optional().default(null).messages(joiCustomMessages).label("Logo"),
});

export const validateCreateJob = (req, res, next) => {
  const { error } = createJobSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

export const createApplicantSchema = Joi.object({
  candidateName: Joi.string().required().messages(joiCustomMessages).label("Candidate Full Name"),
  email: Joi.string().email().allow("", null).optional().messages(joiCustomMessages).label("Candidate Email"),
  phone: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Phone Number"),
  appliedRole: Joi.string().optional().default("Senior Flutter Developer").messages(joiCustomMessages).label("Applied Role"),
  jobId: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Job ID"),
  linkedinUrl: Joi.string().uri().allow("", null).optional().messages(joiCustomMessages).label("LinkedIn Profile URL"),
  notes: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Recruiter Screening Notes"),
});

export const validateCreateApplicant = (req, res, next) => {
  const { error } = createApplicantSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

export const applicantActionSchema = Joi.object({
  id: Joi.string().required().messages(joiCustomMessages).label("Applicant ID"),
});

export const validateApplicantAction = (req, res, next) => {
  const { error } = applicantActionSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

export const changeStageSchema = Joi.object({
  id: Joi.string().required().messages(joiCustomMessages).label("Applicant ID"),
  stage: Joi.string()
    .valid("Sourced", "Screening", "Interview", "Offered", "Hired", "Rejected")
    .required()
    .messages(joiCustomMessages)
    .label("Stage"),
});

export const validateChangeStage = (req, res, next) => {
  const { error } = changeStageSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

export const managerEnquirySchema = Joi.object({
  enquiry_type: Joi.alternatives()
    .try(
      Joi.string().valid("1", "0", "accepted", "pending", "rejected", ""),
      Joi.number().valid(1, 0)
    )
    .optional()
    .allow("", null)
    .messages(joiCustomMessages)
    .label("Enquiry Type"),
});

export const validateManagerEnquiry = (req, res, next) => {
  const { error } = managerEnquirySchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};
