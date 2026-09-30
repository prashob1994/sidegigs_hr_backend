import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * Define the job schema
 */
const jobSchema = mongoose.Schema(
  {
    key_id: {
      type: Number,
      unique: true,
    },
    job_id: {
      type: String,
      required: true,
    },
    job_title: { type: String, required: true },
    company: { type: String, required: true },
    job_description: { type: String, required: false },
    payment: { type: String },
    payment_type: { type: String },
    job_requirements: { type: String },
    location_text: { type: String }, // renamed old location to avoid confusion

    // 🌍 GeoJSON location field for geospatial query
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    }, // longitude

    start_date: { type: Date },
    end_date: { type: Date },

    start_time: { type: String }, // or Date if needed
    end_time: { type: String }, // or Date if needed
    created_by: {
      type: Number,
      ref: "User",
      required: true,
    },

    status: { type: String, enum: ["open", "closed"], default: "open" },
    category: { type: String },
    phone_number: { type: String },
    is_verified: {
      type: Boolean,
      default: false,
    },
    // Application settings
    collect_phone: {
      type: Boolean,
      default: false,
    },

    collect_resume: {
      type: Boolean,
      default: false,
    },

    // Company logo
    logo: {
      type: String, // Store image path or URL
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

jobSchema.plugin(mongoosePaginate);

jobSchema.index({ location: "2dsphere" });

/** To generate next unique id */
jobSchema.pre("save", async function (next) {
  const doc = this;
  // Find the highest ID in the collection and increment it by 1
  const highestUser = await mongoose
    .model("Job")
    .findOne({}, {}, { sort: { key_id: -1 } });
  if (highestUser) {
    doc.key_id = highestUser.key_id + 1;
  } else {
    doc.key_id = 1; // If no documents exist yet, start from 1
  }
  next();
});

const Job = mongoose.model("Job", jobSchema);
export default Job;
