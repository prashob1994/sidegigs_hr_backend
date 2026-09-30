import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      default: null,
      trim: true,
    },
    is_company: {
      type: Boolean,
      default: false,
    },
    is_individual: {
      type: Boolean,
      default: false,
    },
    business_name: {
      type: String,
      default: null,
      trim: true,
    },
    business_type: {
      type: String,
      default: null,
      trim: true,
    },
    location_text: {
      type: String,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    is_hire_works: {
      type: Boolean,
      default: false,
    },
    is_manage_attendance: {
      type: Boolean,
      default: false,
    },
    is_manage_jobs: {
      type: Boolean,
      default: false,
    },
    is_find_temporary_works: {
      type: Boolean,
      default: false,
    },
    organisation: {
      type: String,
      default: "sidegigs",
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "hr", "employee", "user"],
      default: "hr",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);

export default User;
