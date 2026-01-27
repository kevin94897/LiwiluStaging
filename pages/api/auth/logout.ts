// pages/api/auth/logout.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * Next.js API handler for user logout
 * Clears secure cookies and notifies the external API
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    // Notify backend if possible (fire and forget)
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ refreshToken }),
      }).catch(err => console.warn("Logout backend notify failed:", err));
    }

    // Clear cookies
    res.setHeader('Set-Cookie', [
      serialize('accessToken', '', { maxAge: -1, path: '/' }),
      serialize('refreshToken', '', { maxAge: -1, path: '/' }),
      serialize('user', '', { maxAge: -1, path: '/' }),
    ]);

    return res.status(200).json({ success: true, message: 'Sesión cerrada' });

  } catch (error) {
    console.error('❌ Logout proxy error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during logout' });
  }
}
