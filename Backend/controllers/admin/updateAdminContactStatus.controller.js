import ContactSubmission from "../../models/contactSubmission.js";

export const updateAdminContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const allowed = ["new", "read", "replied", "archived"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await ContactSubmission.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: updated._id,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("[Admin] updateAdminContactStatus error:", error);
    return res.status(500).json({ success: false, message: "Failed to update contact status" });
  }
};
