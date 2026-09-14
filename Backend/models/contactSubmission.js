import mongoose from "mongoose";

const ContactSubmissionSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
  },
  { timestamps: true }
);

ContactSubmissionSchema.index({ createdAt: -1 });
ContactSubmissionSchema.index({ email: 1 });

const ContactSubmission = mongoose.model("ContactSubmission", ContactSubmissionSchema);
export default ContactSubmission;
