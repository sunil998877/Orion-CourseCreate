import User from '../../models/userModel.js';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { getJwtSecret } from '../../utils/jwtSecret.js';

export const googleLogin = async (req, res) => {
    try {
        const { credential, idToken, token, accessToken, code, redirectUri } = req.body;
        const candidateToken = credential || idToken || token;

        let googleProfile = null;

        if (code) {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            try {
                const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        code,
                        client_id: clientId,
                        client_secret: clientSecret,
                        redirect_uri: redirectUri || 'postmessage',
                        grant_type: 'authorization_code',
                    }),
                });
                if (tokenRes.ok) {
                    const tokenData = await tokenRes.json();
                    if (tokenData.id_token) {
                        const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`);
                        if (tokenInfoRes.ok) googleProfile = await tokenInfoRes.json();
                    } else if (tokenData.access_token) {
                        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { Authorization: `Bearer ${tokenData.access_token}` }
                        });
                        if (userInfoRes.ok) googleProfile = await userInfoRes.json();
                    }
                }
            } catch (codeErr) {
                console.warn('Google code exchange notice:', codeErr);
            }
        }

        if (!googleProfile && candidateToken) {
            const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(candidateToken)}`);
            if (tokenInfoRes.ok) {
                googleProfile = await tokenInfoRes.json();
            }
        }

        if (!googleProfile && accessToken) {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (userInfoRes.ok) {
                googleProfile = await userInfoRes.json();
            }
        }

        if (!googleProfile || !googleProfile.email) {
            return res.status(400).json({
                message: 'Invalid or expired Google authentication credentials.'
            });
        }


        const email = String(googleProfile.email).trim().toLowerCase();
        const googleId = googleProfile.sub;
        const name = googleProfile.name || googleProfile.given_name || email.split('@')[0];
        const picture = googleProfile.picture || '';

        const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
        if (adminEmail && email === adminEmail) {
            return res.status(403).json({ message: 'Use the admin sign-in page at /admin/login' });
        }

        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        const sessionId = randomUUID();

        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
            }
            if (user.authProvider !== 'google') {
                user.authProvider = 'google';
            }
            if (!user.avatar && picture) {
                user.avatar = picture;
            }
            user.isVerified = true;
            user.activeSessionId = sessionId;
            user.lastLoginAt = new Date();
            user.lastLoginDevice = req.headers['user-agent'] || 'Unknown';
            user.lastLoginIP = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown';
            await user.save();
        } else {
            user = new User({
                email,
                username: name,
                googleId,
                authProvider: 'google',
                avatar: picture,
                organisation: 'Personal',
                isVerified: true,
                hasCourse: false,
                activeSessionId: sessionId,
                lastLoginAt: new Date(),
                lastLoginDevice: req.headers['user-agent'] || 'Unknown',
                lastLoginIP: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown',
            });
            await user.save();
        }

        const jwtToken = jwt.sign(
            {
                id: user._id,
                userId: user._id,
                email: user.email,
                username: user.username,
                sessionId,
            },
            getJwtSecret(),
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            token: jwtToken,
            username: user.username,
            email: user.email,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                organisation: user.organisation,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        return res.status(500).json({
            message: 'An error occurred during Google authentication',
            error: error?.message || String(error)
        });
    }
};
