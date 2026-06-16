// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidPassword(password: string): boolean {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  // Allows a much broader, safer range of special characters
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;
  return passwordRegex.test(password);
}
// MT5 Login ID validation (numeric, typically 1-8 digits)
export function isValidMt5LoginId(loginId: string): boolean {
  return /^\d{1,12}$/.test(loginId);
}

// Transaction hash validation (for crypto or mobile money reference codes)
// Accepts: TRC20 hashes (64 hex chars), MTN refs (10+ digits), Airtel refs (alphanumeric with dashes/slashes)
export function isValidTransactionId(txId: string): boolean {
  const trimmed = txId.trim();
  // Must be 5–200 characters, allow alphanumeric, hyphens, underscores, slashes, dots, spaces
  return /^[\w\-\.\/\s]{5,200}$/.test(trimmed) && trimmed.length >= 5;
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .trim()
    .substring(0, 500); // Max 500 chars
}

// Validate broker server address
export function isValidBrokerServer(server: string): boolean {
  // Typical MT5 server format: broker.com or IP:port
  return /^[a-zA-Z0-9\.\-:]+$/.test(server) && server.length <= 100;
}
