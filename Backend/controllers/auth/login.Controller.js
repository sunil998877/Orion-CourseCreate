import User from '../../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'All the information are required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: 'Invalid password' });

    const sessionId = `${user._id}-${Date.now()}`;
    user.activeSessionId = sessionId;
    user.lastLoginAt = new Date();
    user.lastLoginDevice = req.headers['user-agent'] || 'Unknown';
    user.lastLoginIP = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown';
    await user.save();

    const JWT_SECRET = process.env.JWT_SECRET || 'course12@21';
    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        email: user.email,
        username: user.username,
        sessionId
      },
      JWT_SECRET,
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
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};
