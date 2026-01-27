// pages/api/auth/clear-session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * API route to clear authentication cookies (logout)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Clear all authentication cookies by setting maxAge to -1
    const cookies = [
      serialize('accessToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: -1,
        path: '/',
      }),
      serialize('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: -1,
        path: '/',
      }),
      serialize('user', '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: -1,
        path: '/',
      }),
      serialize('liwilu_session_id', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: -1,
        path: '/',
      }),
    ];

    res.setHeader('Set-Cookie', cookies);

    return res.status(200).json({ 
      success: true, 
      message: 'Session cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing session:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
