import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../utils/jwtSecret.js';
export default function adminAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : null;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }
    try {
        const decoded = jwt.verify(token, getJwtSecret());
        if (!decoded.isAdmin) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        req.user = decoded;
        return next();
    }
    catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired admin session' });
    }
}
