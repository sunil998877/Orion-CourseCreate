import User from '../../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../../utils/jwtSecret.js';

export const login = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'All the information are required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (adminEmail && email === adminEmail) {
      return res.status(403).json({ message: "Use the admin sign-in page at /admin/login" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: 'Invalid password' });

    if (user.isVerified === false) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const sessionId = `${user._id}-${Date.now()}`;
    user.activeSessionId = sessionId;
    user.lastLoginAt = new Date();
    user.lastLoginDevice = req.headers['user-agent'] || 'Unknown';
    user.lastLoginIP = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown';
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        email: user.email,
        username: user.username,
        sessionId
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      username: user.username,
      email: user.email,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        organisation: user.organisation,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
};
