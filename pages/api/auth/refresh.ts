// pages/api/auth/refresh.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * Proxy route for refreshing authentication tokens
 * This route reads the httpOnly refreshToken from cookies and calls the external API
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // 1. Extract refreshToken from httpOnly cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      console.warn('❌ Refresh attempt failed: No refreshToken cookie found');
      return res.status(401).json({
        success: false,
        message: 'No refresh token available'
      });
    }

    // 2. Call external API to refresh tokens
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      console.error('❌ External API refresh failed:', apiResponse.status, errorData);

      // If unauthorized, clear local cookies to signal logout
      if (apiResponse.status === 401 || apiResponse.status === 403) {
        res.setHeader('Set-Cookie', [
          serialize('accessToken', '', { maxAge: -1, path: '/' }),
          serialize('refreshToken', '', { maxAge: -1, path: '/' }),
          serialize('user', '', { maxAge: -1, path: '/' }),
        ]);
      }

      return res.status(apiResponse.status).json({
        success: false,
        message: errorData.message || 'Failed to refresh tokens'
      });
    }

    const result = await apiResponse.json();

    if (!result.success || !result.data) {
      return res.status(500).json({
        success: false,
        message: 'Invalid response from refresh API'
      });
    }

    // 3. Set new httpOnly cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const { accessToken, refreshToken: newRefreshToken } = result.data;

    const cookies = [
      serialize('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours (86400 seconds)
        path: '/',
      }),
      serialize('refreshToken', newRefreshToken, {
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
      data: { accessToken } // Return accessToken if needed by client (though mostly used via cookies)
    });

  } catch (error) {
    console.error('❌ Error during token refresh proxy:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during refresh'
    });
  }
}
