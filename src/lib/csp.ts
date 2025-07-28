// Content Security Policy utility
export const setupCSP = () => {
  // Only set CSP if we're in a browser environment
  if (typeof document === 'undefined') return;

  // Check if CSP meta tag already exists
  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingCSP) return;

  // Create CSP meta tag
  const cspMeta = document.createElement('meta');
  cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
  
  // Define CSP policy
  const cspPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for React and Mermaid
    "style-src 'self' 'unsafe-inline'", // Required for CSS-in-JS and Tailwind
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.anthropic.com",
    "font-src 'self' data:",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content"
  ].join('; ');
  
  cspMeta.setAttribute('content', cspPolicy);
  
  // Add to document head
  document.head.appendChild(cspMeta);
};

// Additional security headers for development
export const logSecurityRecommendations = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 Security Recommendations for Production:');
    console.log('1. Configure proper CSP headers on your web server');
    console.log('2. Enable HTTPS and HSTS');
    console.log('3. Set X-Frame-Options: DENY');
    console.log('4. Set X-Content-Type-Options: nosniff');
    console.log('5. Review and test all security policies');
  }
};