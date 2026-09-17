import Joi from "joi";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";

export const createJobSchema = Joi.object({
  title: Joi.string().required().messages(joiCustomMessages).label("Job Title"),
  department: Joi.string()
    .valid("Engineering", "Design", "HR", "Product")
    .optional()
    .default("Engineering")
    .messages(joiCustomMessages)
    .label("Department"),
  workplaceType: Joi.string()
    .valid("Remote", "Onsite", "Hybrid")
    .optional()
    .default("Remote")
    .messages(joiCustomMessages)
    .label("Workplace Type"),
  location: Joi.string().optional().messages(joiCustomMessages).label("Location"),
  deadline: Joi.date().iso().optional().allow("", null).messages(joiCustomMessages).label("Deadline"),
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
