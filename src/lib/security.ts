import DOMPurify from 'dompurify';

// Crypto utility for API key encryption
export class SecureStorage {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  
  private static async generateKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private static getDeviceFingerprint(): string {
    // Create a simple device fingerprint for key derivation
    return btoa(
      `${navigator.userAgent}-${navigator.language}-${screen.width}x${screen.height}`
    ).slice(0, 32);
  }

  static async encryptData(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Generate salt
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      
      // Derive key from device fingerprint
      const key = await this.deriveKey(this.getDeviceFingerprint(), salt);
      
      // Generate IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
        },
        key,
        dataBuffer
      );

      // Combine salt + iv + encrypted data
      const combinedBuffer = new Uint8Array(
        salt.length + iv.length + encryptedBuffer.byteLength
      );
      combinedBuffer.set(salt, 0);
      combinedBuffer.set(iv, salt.length);
      combinedBuffer.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

      // Return base64 encoded
      return btoa(String.fromCharCode(...combinedBuffer));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static async decryptData(encryptedData: string): Promise<string> {
    try {
      // Decode base64
      const combinedBuffer = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      // Extract components
      const salt = combinedBuffer.slice(0, 16);
      const iv = combinedBuffer.slice(16, 28);
      const encrypted = combinedBuffer.slice(28);

      // Derive key
      const key = await this.deriveKey(this.getDeviceFingerprint(), salt);

      // Decrypt
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
        },
        key,
        encrypted
      );

      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}

// HTML sanitization utilities
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'p', 'span', 'br'],
    ALLOWED_ATTR: ['class', 'style'],
    KEEP_CONTENT: true
  });
};

// Safe DOM manipulation for Mermaid
export const safeSetInnerHTML = (element: HTMLElement, content: string): void => {
  // Clear existing content
  element.innerHTML = '';
  
  // For Mermaid SVG content, we need to validate it's actually SVG
  if (content.includes('<svg')) {
    // Create a temporary container to validate SVG
    const temp = document.createElement('div');
    temp.innerHTML = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['svg', 'g', 'path', 'text', 'rect', 'circle', 'line', 'polygon', 'polyline', 'ellipse', 'defs', 'marker', 'tspan'],
      ALLOWED_ATTR: ['viewBox', 'width', 'height', 'xmlns', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'fill', 'stroke', 'stroke-width', 'transform', 'd', 'class', 'id', 'style', 'font-family', 'font-size', 'text-anchor', 'dominant-baseline', 'points', 'markerWidth', 'markerHeight', 'refX', 'refY', 'orient', 'markerUnits'],
      ADD_TAGS: ['foreignObject'],
      KEEP_CONTENT: true
    });
    
    element.appendChild(temp.firstChild || temp);
  } else {
    // For error messages or other content
    element.innerHTML = sanitizeHTML(content);
  }
};

// Input validation
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file: File, maxSizeBytes: number): boolean => {
  return file.size <= maxSizeBytes;
};

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    // Update the attempts array
    this.attempts.set(identifier, validAttempts);
    
    return validAttempts.length >= this.maxAttempts;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    attempts.push(now);
    this.attempts.set(identifier, attempts);
  }

  getRemainingAttempts(identifier: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxAttempts - validAttempts.length);
  }

  getTimeUntilReset(identifier: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const resetTime = oldestAttempt + this.windowMs;
    return Math.max(0, resetTime - now);
  }
}

// Security event logging
export const logSecurityEvent = (event: string, details: any, severity: 'info' | 'warning' | 'error' = 'info') => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    details,
    severity,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.log(`[SECURITY ${severity.toUpperCase()}]`, logEntry);
  
  // Store in localStorage for audit trail (limit to last 100 entries)
  try {
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    if (logs.length > 100) logs.shift();
    localStorage.setItem('security_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to store security log:', error);
  }
}

// API key rotation reminder
export const checkApiKeyAge = (keyName: string): { shouldRotate: boolean; daysOld: number } => {
  try {
    const stored = localStorage.getItem(`${keyName}_created`);
    if (!stored) return { shouldRotate: false, daysOld: 0 };
    
    const created = new Date(stored);
    const now = new Date();
    const daysOld = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    const shouldRotate = daysOld > 90; // Recommend rotation after 90 days
    
    return { shouldRotate, daysOld };
  } catch {
    return { shouldRotate: false, daysOld: 0 };
  }
};

export const markApiKeyCreated = (keyName: string) => {
  localStorage.setItem(`${keyName}_created`, new Date().toISOString());
};