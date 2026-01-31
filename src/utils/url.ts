import React, { ReactNode } from 'react';

/**
 * URL Detection and Linkification Utilities
 * Story 3.2: URL Detection & Clickable Links
 */

// Regex to match URLs: http://, https://, or www.
const URL_REGEX = /https?:\/\/[^\s<>"']+|www\.[^\s<>"']+/gi;

/**
 * Detects all URLs in a given text string
 * @param text - The text to search for URLs
 * @returns Array of URLs found in the text
 */
export const detectUrls = (text: string): string[] => {
  if (!text) return [];
  // Reset regex lastIndex before matching
  URL_REGEX.lastIndex = 0;
  return text.match(URL_REGEX) || [];
};

/**
 * Checks if a text string contains any URLs
 * @param text - The text to check
 * @returns True if the text contains at least one URL
 */
export const hasUrl = (text: string): boolean => {
  if (!text) return false;
  // Reset regex lastIndex before testing
  URL_REGEX.lastIndex = 0;
  return URL_REGEX.test(text);
};

/**
 * Normalizes a URL by adding https:// if it starts with www.
 * @param url - The URL to normalize
 * @returns The normalized URL with proper protocol
 */
export const normalizeUrl = (url: string): string => {
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }
  return url;
};

/**
 * Converts text containing URLs into React nodes with clickable links
 * Links have:
 * - target="_blank" to open in new tab
 * - rel="noopener noreferrer" for security
 * - onClick stopPropagation to prevent card expand
 * - Blue color with hover underline styling
 *
 * @param text - The text to linkify
 * @returns ReactNode with plain text and anchor elements
 */
export const linkifyText = (text: string): ReactNode => {
  if (!text) return text;

  const urlRegex = /https?:\/\/[^\s<>"']+|www\.[^\s<>"']+/gi;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // Reset regex
  urlRegex.lastIndex = 0;

  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add the URL as a link
    const url = match[0];
    const href = normalizeUrl(url);
    parts.push(
      React.createElement(
        'a',
        {
          key: match.index,
          href: href,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'text-blue-600 hover:underline',
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
        },
        url
      )
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? React.createElement(React.Fragment, null, ...parts) : text;
};
