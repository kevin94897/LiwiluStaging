// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * Next.js API handler for user login
 * Proxies to external API and sets secure httpOnly cookies
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      return res.status(apiResponse.status).json({ 
        success: false, 
        message: errorData.message || 'Error al iniciar sesión' 
      });
    }

    const result = await apiResponse.json();

    if (result.success && result.data) {
      const { accessToken, refreshToken, user, sessionId } = result.data;
      const isProduction = process.env.NODE_ENV === 'production';

      // Set httpOnly cookies
      const cookies = [
        serialize('accessToken', accessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          maxAge: 15 * 60, // 15 min
          path: '/',
        }),
        serialize('refreshToken', refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: '/',
        }),
        serialize('liwilu_session_id', sessionId || '', {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        }),
        serialize('user', JSON.stringify(user), {
          httpOnly: false, // Client-accessible
          secure: isProduction,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        }),
      ];

      res.setHeader('Set-Cookie', cookies);

      return res.status(200).json(result);
    }

    return res.status(500).json({ success: false, message: 'Invalid response from backend' });

  } catch (error) {
    console.error('❌ Login proxy error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
}
