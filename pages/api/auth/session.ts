// pages/api/auth/session.ts
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Endpoint para obtener el accessToken desde la cookie HttpOnly
 * El cliente llama a este endpoint al cargar la página para rehidratar el token en memoria
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Leer la cookie HttpOnly que contiene el accessToken
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ 
        authenticated: false,
        message: 'No access token found' 
      });
    }

    // Retornar el token para que el cliente lo guarde en memoria
    return res.status(200).json({
      authenticated: true,
      accessToken,
    });
  } catch (error) {
    console.error('Error in /api/auth/session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
