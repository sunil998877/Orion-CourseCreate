import ContactSubmission from "../../models/contactSubmission.js";

export const deleteAdminContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ContactSubmission.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    return res.status(200).json({ success: true, message: "Contact deleted" });
  } catch (error) {
    console.error("[Admin] deleteAdminContact error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete contact" });
  }
};
