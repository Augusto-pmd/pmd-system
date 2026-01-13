"use client";

import { sanitizeHtml, sanitizeText, containsSuspiciousContent } from "@/lib/sanitize";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

interface SafeTextProps {
  children: string;
  allowHtml?: boolean;
  allowedTags?: string[];
  className?: string;
  showWarning?: boolean;
}

/**
 * Component to safely display user-generated text
 * Automatically sanitizes content to prevent XSS attacks
 */
export function SafeText({ 
  children, 
  allowHtml = false, 
  allowedTags = [],
  className = "",
  showWarning = true,
}: SafeTextProps) {
  const [hasSuspiciousContent, setHasSuspiciousContent] = useState(false);
  const [sanitizedContent, setSanitizedContent] = useState("");

  useEffect(() => {
    if (!children || typeof children !== 'string') {
      setSanitizedContent('');
      setHasSuspiciousContent(false);
      return;
    }

    // Check for suspicious content
    const suspicious = containsSuspiciousContent(children);
    setHasSuspiciousContent(suspicious);

    // Sanitize content
    if (allowHtml && allowedTags.length > 0) {
      setSanitizedContent(sanitizeHtml(children));
    } else if (allowHtml) {
      // Use DOMPurify with default settings if allowHtml is true but no tags specified
      const DOMPurifyLib = typeof window !== 'undefined' ? require('dompurify') : null;
      if (DOMPurifyLib) {
        setSanitizedContent(DOMPurifyLib.sanitize(children));
      } else {
        setSanitizedContent(sanitizeText(children));
      }
    } else {
      setSanitizedContent(sanitizeText(children));
    }
  }, [children, allowHtml, allowedTags]);

  if (!children) {
    return null;
  }

  return (
    <div className={className}>
      {hasSuspiciousContent && showWarning && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Contenido potencialmente peligroso detectado y sanitizado</span>
        </div>
      )}
      {allowHtml ? (
        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      ) : (
        <span>{sanitizedContent}</span>
      )}
    </div>
  );
}

