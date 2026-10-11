import Joi from "joi";
import joiCustomMessages from "../../../utils/joiCustomMessages.js";

export const sendMessageSchema = Joi.object({
  user_id: Joi.number().required().messages(joiCustomMessages).label("User ID"),
  message: Joi.string().trim().required().messages(joiCustomMessages).label("Message"),
  conversation_id: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Conversation ID"),
  job_id: Joi.number().allow("", null).optional().messages(joiCustomMessages).label("Job ID"),
  user_name: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("User Name"),
  user_avatar: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("User Avatar"),
  attachments: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().required(),
        file_type: Joi.string().allow("", null).optional(),
        file_name: Joi.string().allow("", null).optional(),
      })
    )
    .optional()
    .default([]),
});

export const validateSendMessage = (req, res, next) => {
  const { error } = sendMessageSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

export const incomingMessageSchema = Joi.object({
  sender_id: Joi.number().required().messages(joiCustomMessages).label("Sender (User) ID"),
  hr_id: Joi.number().allow("", null).optional().messages(joiCustomMessages).label("HR ID"),
  receiver_id: Joi.number().allow("", null).optional().messages(joiCustomMessages).label("Receiver ID"),
  conversation_id: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Conversation ID"),
  message: Joi.string().trim().required().messages(joiCustomMessages).label("Message"),
  sender_name: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Sender Name"),
  job_id: Joi.number().allow("", null).optional().messages(joiCustomMessages).label("Job ID"),
  external_message_id: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("External Message ID"),
  attachments: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().required(),
        file_type: Joi.string().allow("", null).optional(),
        file_name: Joi.string().allow("", null).optional(),
      })
    )
    .optional()
    .default([]),
});

export const validateIncomingMessage = (req, res, next) => {
  const { error } = incomingMessageSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

export const syncMessagesSchema = Joi.object({
  conversation_id: Joi.string().allow("", null).optional().messages(joiCustomMessages).label("Conversation ID"),
  user_id: Joi.number().allow("", null).optional().messages(joiCustomMessages).label("User ID"),
  since: Joi.date().iso().allow("", null).optional().messages(joiCustomMessages).label("Since Date"),
});

export const validateSyncMessages = (req, res, next) => {
  const { error } = syncMessagesSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      status: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};
