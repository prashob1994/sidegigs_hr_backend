import Joi from "joi";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";

export const createJobSchema = Joi.object({
  _id: Joi.any().optional().messages(joiCustomMessages).label("Mongo ID"),
  id: Joi.alternatives().try(Joi.string(), Joi.number()).optional().messages(joiCustomMessages).label("Job ID"),
  key_id: Joi.number().optional().messages(joiCustomMessages).label("Key ID"),
  job_id: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Job ID"),
  job_title: Joi.string().required().messages(joiCustomMessages).label("Job Title"),
  company: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Company"),
  job_description: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Job Description"),
  payment: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Payment"),
  payment_type: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Payment Type"),
  job_requirements: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Job Requirements"),
  location_text: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Location Text"),
  location: Joi.alternatives()
    .try(
      Joi.object({
        type: Joi.string().valid("Point").default("Point").messages(joiCustomMessages).label("Location Type"),
        coordinates: Joi.array()
          .items(Joi.number())
          .length(2)
          .optional()
          .messages(joiCustomMessages)
          .label("Location Coordinates"),
      }),
      Joi.array().items(Joi.number()).length(2)
    )
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
}).options({ abortEarly: false, stripUnknown: true });

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

export const updateJobSchema = Joi.object({
  _id: Joi.any().optional().messages(joiCustomMessages).label("Mongo ID"),
  id: Joi.alternatives().try(Joi.string(), Joi.number()).optional().messages(joiCustomMessages).label("Job ID"),
  job_id: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Job String ID"),
  key_id: Joi.number().optional().messages(joiCustomMessages).label("Job Key ID"),
  job_title: Joi.string().optional().messages(joiCustomMessages).label("Job Title"),
  company: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Company"),
  job_description: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Job Description"),
  payment: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Payment"),
  payment_type: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Payment Type"),
  job_requirements: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Job Requirements"),
  location_text: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Location Text"),
  location: Joi.alternatives()
    .try(
      Joi.object({
        type: Joi.string().valid("Point").default("Point").messages(joiCustomMessages).label("Location Type"),
        coordinates: Joi.array().items(Joi.number()).length(2).optional().messages(joiCustomMessages).label("Location Coordinates"),
      }),
      Joi.array().items(Joi.number()).length(2)
    )
    .optional()
    .messages(joiCustomMessages)
    .label("Location"),
  start_date: Joi.date().iso().allow("", null).optional().messages(joiCustomMessages).label("Start Date"),
  end_date: Joi.date().iso().allow("", null).optional().messages(joiCustomMessages).label("End Date"),
  start_time: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Start Time"),
  end_time: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("End Time"),
  created_by: Joi.number().optional().messages(joiCustomMessages).label("Created By"),
  status: Joi.string().valid("open", "closed").optional().messages(joiCustomMessages).label("Status"),
  category: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Category"),
  phone_number: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Phone Number"),
  is_verified: Joi.boolean().optional().messages(joiCustomMessages).label("Is Verified"),
  collect_phone: Joi.boolean().optional().messages(joiCustomMessages).label("Collect Phone"),
  collect_resume: Joi.boolean().optional().messages(joiCustomMessages).label("Collect Resume"),
  logo: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Logo"),
})
  .or("_id", "id", "job_id", "key_id")
  .options({ abortEarly: false, stripUnknown: true });

export const validateUpdateJob = (req, res, next) => {
  const { error } = updateJobSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

export const syncApplicationSchema = Joi.object({
  hr_job_id: Joi.alternatives().try(Joi.string(), Joi.number()).allow("", null).optional(),
  job_key_id: Joi.number().allow(null).optional(),
  user_job_key_id: Joi.number().allow(null).optional(),
  job_title: Joi.string().allow("", null).optional(),
  company: Joi.string().allow("", null).optional(),
  candidateName: Joi.string().required().messages(joiCustomMessages).label("Candidate Name"),
  email: Joi.string().email().allow("", null).optional().messages(joiCustomMessages).label("Candidate Email"),
  phone: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Phone Number"),
  resume: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Resume URL/Path"),
  education_id: Joi.number().allow(null).optional(),
  age_id: Joi.number().allow(null).optional(),
  is_experienced: Joi.boolean().optional().default(false),
  is_disabled: Joi.boolean().optional().default(false),
  location: Joi.string().allow("", null).optional(),
  service_key: Joi.string().optional(),
  user_id: Joi.number().allow(null).optional(),
  created_by: Joi.number().allow(null).optional(),
}).options({ abortEarly: false, stripUnknown: true });

export const validateSyncApplication = (req, res, next) => {
  const { error } = syncApplicationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

export const deleteJobSchema = Joi.object({
  _id: Joi.any().optional().messages(joiCustomMessages).label("Mongo ID"),
  id: Joi.alternatives().try(Joi.string(), Joi.number()).optional().messages(joiCustomMessages).label("Job ID"),
  job_id: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Job String ID"),
  key_id: Joi.number().optional().messages(joiCustomMessages).label("Job Key ID"),
  service_key: Joi.string().optional(),
})
  .or("_id", "id", "job_id", "key_id")
  .options({ abortEarly: false, stripUnknown: true });

export const validateDeleteJob = (req, res, next) => {
  if (req.params.id && !req.body.id && !req.body._id && !req.body.job_id && !req.body.key_id) {
    req.body.id = req.params.id;
  }
  const { error } = deleteJobSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

export const changeStatusSchema = Joi.object({
  _id: Joi.any().optional().messages(joiCustomMessages).label("Mongo ID"),
  id: Joi.alternatives().try(Joi.string(), Joi.number()).optional().messages(joiCustomMessages).label("Application / UserJob ID"),
  job_id: Joi.alternatives().try(Joi.string(), Joi.number()).optional().messages(joiCustomMessages).label("UserJob Key ID"),
  key_id: Joi.number().optional().messages(joiCustomMessages).label("UserJob Key ID"),
  status: Joi.string()
    .valid("accepted", "rejected", "pending")
    .default("pending")
    .optional()
    .messages(joiCustomMessages)
    .label("Status"),
  stage: Joi.string()
    .valid("Applied", "Screening", "Interview", "Offered", "Hired", "Rejected")
    .optional()
    .messages(joiCustomMessages)
    .label("Pipeline Stage"),
  service_key: Joi.string().optional(),
})
  .or("_id", "id", "job_id", "key_id")
  .options({ abortEarly: false, stripUnknown: true });

export const validateChangeStatus = (req, res, next) => {
  if (req.params.id && !req.body.id && !req.body._id && !req.body.job_id && !req.body.key_id) {
    req.body.id = req.params.id;
  }
  const { error } = changeStatusSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};
