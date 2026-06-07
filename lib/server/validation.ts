// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export function isValidPassword(password: string): boolean {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// MT5 Login ID validation (numeric, typically 1-8 digits)
export function isValidMt5LoginId(loginId: string): boolean {
  return /^\d{1,8}$/.test(loginId);
}

// Transaction hash validation (for crypto or reference codes)
export function isValidTransactionId(txId: string): boolean {
  // Allow alphanumeric, hyphens, underscores - between 10 and 100 chars
  return /^[a-zA-Z0-9\-_]{10,100}$/.test(txId);
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
