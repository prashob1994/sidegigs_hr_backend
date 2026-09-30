import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * Define the userJob schema
 */
const userJobSchema = mongoose.Schema(
  {
    key_id: {
      type: Number,
      unique: true,
    },
    job_id: {
      type: Number,
      required: true,
    },
    user_id: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "rejected", "pending"],
      default: "pending",
    },
    education_id: {
      type: Number,
      required: false,
    },
    age_id: {
      type: Number,
      required: false,
    },
    is_experienced: {
      type: Boolean,
      default: false,
    },
    is_disabled: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      required: false,
    },

    // Optional applicant details
    name: {
      type: String,
      trim: true,
      required: false,
    },
    phone: {
      type: String,
      trim: true,
      required: false,
    },
    resume: {
      type: String,
      required: false, // Store URL or file path
    },

    created_by: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userJobSchema.plugin(mongoosePaginate);

/** To generate next unique id */
userJobSchema.pre("save", async function (next) {
  const doc = this;

  // Generate key_id only for new documents
  if (!doc.isNew) return next();

  const highestUser = await mongoose
    .model("UserJob")
    .findOne({}, {}, { sort: { key_id: -1 } });

  doc.key_id = highestUser ? highestUser.key_id + 1 : 1;

  next();
});

const UserJob = mongoose.model("UserJob", userJobSchema);

export default UserJob;
