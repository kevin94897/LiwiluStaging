// pages/api/proxy/[...path].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * Generic API Proxy for handling secure authentication with httpOnly cookies
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path, ...queryParams } = req.query;
  const endpoint = Array.isArray(path) ? path.join('/') : path;
  
  if (!endpoint) {
    return res.status(400).json({ success: false, message: 'Invalid path' });
  }

  try {
    // Reconstruct query string
    const queryString = new URLSearchParams(queryParams as Record<string, string>).toString();
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    // 1. Get tokens and session ID from cookies (server-side)
    const accessToken = req.cookies.accessToken;
    const sessionId = req.cookies.liwilu_session_id;
    
    // 2. Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Forward Session ID if present in cookies
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    // 3. Prepare request options
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    // Forward body if not GET/HEAD
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    // 4. Call external API
    const apiResponse = await fetch(apiUrl, fetchOptions);
    
    // 5. Handle response
    const data = await apiResponse.json().catch(() => ({}));

    // If response contains a NEW sessionId, set it as httpOnly cookie
    if (data?.data?.sessionId) {
      const isProduction = process.env.NODE_ENV === 'production';
      const cookie = serialize('liwilu_session_id', data.data.sessionId, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
      
      // Existing cookies should be preserved if possible, but here we usually set only one
      // If we need to set multiple (e.g. if we already had Set-Cookie), we'd merge them
      res.setHeader('Set-Cookie', cookie);
    }
    
    return res.status(apiResponse.status).json(data);

  } catch (error) {
    console.error(`❌ Proxy error for ${endpoint}:`, error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error in API proxy' 
    });
  }
}
