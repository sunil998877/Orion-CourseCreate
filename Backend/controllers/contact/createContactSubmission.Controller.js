import ContactSubmission from "../../models/contactSubmission.js";

export const createContactSubmission = async (req, res) => {
  try {
    const { fullName, company, email, phone, message } = req.body || {};

    if (!fullName?.trim() || !company?.trim() || !email?.trim() || !phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name, company, email, and phone are required",
      });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
    if (!emailOk) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    const submission = await ContactSubmission.create({
      fullName: String(fullName).trim(),
      company: String(company).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      message: message ? String(message).trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Message received successfully",
      data: { id: submission._id },
    });
  } catch (error) {
    console.error("[Contact] createContactSubmission error:", error);
    return res.status(500).json({ success: false, message: "Failed to save message" });
  }
};
