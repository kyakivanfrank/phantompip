/**
 * Environment variable validation
 * This should be called on app startup to ensure all required env vars are present
 */

export interface EnvironmentValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): EnvironmentValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables for production
  const requiredVars = [
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "ENCRYPTION_KEY",
  ];

  const isProduction = process.env.NODE_ENV === "production";

  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === "") {
      const message = `Missing required environment variable: ${varName}`;
      if (isProduction) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }
  }

  // Validate SESSION_EXPIRY is a valid number if set
  if (process.env.SESSION_EXPIRY) {
    const sessionExpiry = parseInt(process.env.SESSION_EXPIRY, 10);
    if (isNaN(sessionExpiry) || sessionExpiry <= 0) {
      errors.push(
        `SESSION_EXPIRY must be a positive number, got: ${process.env.SESSION_EXPIRY}`
      );
    }
  }

  // Validate NODE_ENV
  if (
    process.env.NODE_ENV &&
    !["development", "production", "test"].includes(process.env.NODE_ENV)
  ) {
    errors.push(
      `Invalid NODE_ENV value: ${process.env.NODE_ENV}. Must be 'development', 'production', or 'test'.`
    );
  }

  // Warn about missing NEXT_PUBLIC_API_URL in production
  if (isProduction && !process.env.NEXT_PUBLIC_API_URL) {
    warnings.push(
      "NEXT_PUBLIC_API_URL not set. API calls from browser will use window.location.origin as fallback."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Log environment validation results
 */
export function logEnvironmentValidation(): void {
  const validation = validateEnvironment();

  if (validation.warnings.length > 0) {
    console.warn("⚠️  Environment Warnings:");
    validation.warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (!validation.valid) {
    console.error("❌ Environment Validation Failed:");
    validation.errors.forEach((e) => console.error(`  - ${e}`));
    throw new Error(
      "Environment validation failed. Please check your configuration."
    );
  }

  if (validation.warnings.length === 0 && validation.errors.length === 0) {
    console.log("✅ Environment variables validated successfully");
  }
}
