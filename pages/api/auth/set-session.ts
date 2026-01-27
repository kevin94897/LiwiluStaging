// pages/api/auth/set-session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * API route to set authentication cookies (httpOnly)
 * This is necessary because httpOnly cookies cannot be set from client-side JavaScript
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { accessToken, refreshToken, user, sessionId } = req.body;

    if (!accessToken || !refreshToken || !user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: accessToken, refreshToken, or user' 
      });
    }

    const isProduction = process.env.NODE_ENV === 'production';

    // Set httpOnly cookies for tokens (secure, not accessible from JavaScript)
    const cookies = [
      serialize('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      }),
      serialize('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      }),
      // User data in a regular cookie (accessible from client for UI purposes)
      serialize('user', JSON.stringify(user), {
        httpOnly: false, // Accessible from client
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      }),
      serialize('liwilu_session_id', sessionId || '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      }),
    ];

    res.setHeader('Set-Cookie', cookies);

    return res.status(200).json({ 
      success: true, 
      message: 'Session established successfully' 
    });
  } catch (error) {
    console.error('Error setting session:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
