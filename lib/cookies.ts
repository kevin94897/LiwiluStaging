// lib/cookies.ts
import { serialize, parse } from 'cookie';

export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie (client-side)
 * Note: httpOnly cookies cannot be set from client-side, use API routes instead
 */
export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
) => {
  if (typeof window === 'undefined') return;

  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

  const cookieOptions: CookieOptions = {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    ...options,
  };

  document.cookie = serialize(name, stringValue, cookieOptions);
};

/**
 * Get a cookie value (client-side)
 */
export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const cookies = parse(document.cookie);
  return cookies[name] || null;
};

/**
 * Remove a cookie (client-side)
 */
export const removeCookie = (name: string) => {
  setCookie(name, '', { maxAge: -1 });
};

/**
 * Get cookie from request headers (server-side)
 */
export const getCookieFromRequest = (cookieHeader: string | undefined, name: string): string | null => {
  if (!cookieHeader) return null;
  
  const cookies = parse(cookieHeader);
  return cookies[name] || null;
};

/**
 * Get all cookies from request (server-side)
 */
export const getAllCookiesFromRequest = (cookieHeader: string | undefined): Record<string, string> => {
  if (!cookieHeader) return {};
  const cookies = parse(cookieHeader);
  // Filter out undefined values to match the return type
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(cookies)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};
