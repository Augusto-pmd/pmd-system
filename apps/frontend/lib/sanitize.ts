/**
 * XSS Sanitization utilities for frontend
 * Uses DOMPurify for HTML sanitization
 */

/**
 * Get DOMPurify instance (only available in browser)
 */
function getDOMPurify() {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    // Dynamic import to avoid SSR issues
    return require('dompurify');
  } catch {
    return null;
  }
}

/**
 * Sanitize HTML string
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }
  const DOMPurify = getDOMPurify();
  if (!DOMPurify) {
    // Fallback: remove all HTML tags
    return html.replace(/<[^>]*>/g, '');
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [], // No HTML tags allowed by default
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize HTML string but allow some safe tags
 */
export function sanitizeHtmlWithTags(html: string, allowedTags: string[] = ['p', 'br', 'strong', 'em', 'u']): string {
  if (typeof html !== 'string') {
    return '';
  }
  const DOMPurify = getDOMPurify();
  if (!DOMPurify) {
    // Fallback: remove all HTML tags except allowed ones
    const allowedTagsRegex = new RegExp(`</?(?!${allowedTags.join('|')})[^>]+>`, 'gi');
    return html.replace(allowedTagsRegex, '');
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize plain text (remove all HTML)
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }
  // Remove HTML tags and decode HTML entities
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) {
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
  }
  // Fallback for SSR
  return text.replace(/<[^>]*>/g, '').replace(/&[#\w]+;/g, '');
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Check if string contains potentially dangerous content
 */
export function containsSuspiciousContent(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i,
    /vbscript:/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitize input before sending to API
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Check for suspicious content
    if (containsSuspiciousContent(input)) {
      console.warn('Suspicious content detected in input, sanitizing...');
    }
    return sanitizeText(input);
  }
  return sanitizeObject(input);
}

