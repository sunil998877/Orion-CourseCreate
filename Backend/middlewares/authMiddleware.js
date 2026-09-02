import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export default async function authenticateJWT(req, res, next) {
  if (req.method === 'OPTIONS') return next();

  let token = null;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader) {
    if (typeof authHeader === 'string' && (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer '))) {
      token = authHeader.slice(7).trim();
    } else if (typeof authHeader === 'string') {
      token = authHeader.trim();
    }
  } else if (req.query?.token) {
    token = req.query.token;
  }

  
  if (typeof token === 'string') {
    try {
      token = decodeURIComponent(token).trim();
    } catch {
      token = token.trim();
    }
    token = token.replace(/^Bearer\s+/i, '');
    token = token.replace(/^["']+|["']+$/g, '').trim();
  }

  
  if ((!token || req.query?.dev === 'true') && process.env.NODE_ENV !== 'production' && req.query?.dev === 'true') {
    const devUser = await User.findOne();
    if (devUser) {
      req.user = {
        id: devUser._id,
        _id: devUser._id,
        email: devUser.email,
        username: devUser.username,
      };
      return next();
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Authorization token required (Header: Authorization or ?token=<token> or ?dev=true in dev mode)" });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'course12@21';
    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.id || decoded.userId || decoded._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (decoded.sessionId && user.activeSessionId && decoded.sessionId !== user.activeSessionId) {
      return res.status(401).json({ success: false, message: "Session expired. Logged in from another device." });
    }

    req.user = {
      ...decoded,
      id: userId,
      _id: userId
    };
    next();
  } catch (err) {
    console.error("JWT Verification Failed:", err.message);
    return res.status(401).json({ success: false, message: "Unauthorized: " + err.message });
  }
}
