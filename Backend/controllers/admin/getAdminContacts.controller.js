import ContactSubmission from "../../models/contactSubmission.js";

export const getAdminContacts = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status && status !== "ALL") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const [rows, total] = await Promise.all([
      ContactSubmission.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ContactSubmission.countDocuments(query),
    ]);

    const contacts = rows.map((c) => ({
      id: c._id,
      fullName: c.fullName,
      company: c.company,
      email: c.email,
      phone: c.phone,
      message: c.message || "",
      status: c.status || "new",
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      data: { contacts, total, page: pageNum, limit: limitNum },
    });
  } catch (error) {
    console.error("[Admin] getAdminContacts error:", error);
    return res.status(500).json({ success: false, message: "Failed to load contact submissions" });
  }
};
