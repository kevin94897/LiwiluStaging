// pages/api/auth/get-tokens.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getCookieFromRequest } from '@/lib/cookies';

/**
 * API route to get authentication tokens from httpOnly cookies
 * This allows server-side code to access the tokens
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const cookieHeader = req.headers.cookie;
    
    const accessToken = getCookieFromRequest(cookieHeader, 'accessToken');
    const refreshToken = getCookieFromRequest(cookieHeader, 'refreshToken');

    if (!accessToken || !refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'No active session' 
      });
    }

    return res.status(200).json({ 
      success: true,
      data: {
        accessToken,
        refreshToken,
      }
    });
  } catch (error) {
    console.error('Error getting tokens:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
