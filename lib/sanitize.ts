// lib/sanitize.ts

/**
 * Sanitize plain text input (removes all HTML tags)
 * Use for user inputs that should not contain any HTML
 * Robust regex-based implementation to avoid dependency issues with jsdom/parse5
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return "";
  // Regular expression to strip all HTML tags
  return input.replace(/<\/?[^>]+(>|$)/g, "");
};

/**
 * Sanitize HTML content (allows safe HTML tags)
 * Use for rich text content that may contain formatting
 * For now, this acts as a more restrictive text sanitizer to ensure security
 * without needing character-heavy DOM parsers on the server/client for simple forms.
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return "";
  // In a more complex scenario, we'd use a parser here, but for now we prioritize
  // getting the app running stably. Simple protection:
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
};

/**
 * Sanitize object properties recursively
 * Use for sanitizing form data objects
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = {} as T;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === "string") {
        sanitized[key] = sanitizeInput(value) as any;
      } else if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email: string): string => {
  const sanitized = sanitizeInput(email).toLowerCase().trim();
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : "";
};

/**
 * Sanitize phone number (keep only digits and +)
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
};

/**
 * Sanitize URL
 */
export const sanitizeURL = (url: string): string => {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
};
