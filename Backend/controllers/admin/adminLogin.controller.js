import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getJwtSecret } from "../../utils/jwtSecret.js";

function safeEqual(left, right) {
    const a = Buffer.from(String(left));
    const b = Buffer.from(String(right));
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

export const adminLogin = (req, res) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || "");

    if (!adminEmail || !adminPassword) {
        return res.status(503).json({ message: "Admin credentials are not configured" });
    }

    if (!safeEqual(email, adminEmail) || !safeEqual(password, adminPassword)) {
        return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
        { id: "admin", email: adminEmail, username: "Administrator", isAdmin: true },
        getJwtSecret(),
        { expiresIn: "8h" }
    );

    return res.status(200).json({
        token,
        email: adminEmail,
        username: "Administrator",
        isAdmin: true,
    });
};

export default adminLogin;
