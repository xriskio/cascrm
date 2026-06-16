import crypto from "crypto"

/**
 * Generates a secure random token
 * @param length Length of the token
 * @returns Secure random token
 */
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return ""

  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Validates an email address format
 * @param email Email address to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Checks password strength
 * @param password Password to check
 * @returns Object with score and feedback
 */
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string
} {
  if (!password) {
    return { score: 0, feedback: "Password is required" }
  }

  let score = 0
  const feedback = []

  // Length check
  if (password.length < 8) {
    feedback.push("Password should be at least 8 characters")
  } else {
    score += 1
  }

  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  // Feedback based on score
  if (score < 3) {
    feedback.push("Add uppercase letters, numbers, and special characters")
  }

  return {
    score,
    feedback: feedback.join(". "),
  }
}

/**
 * Creates a Content Security Policy header value
 * @returns CSP header value
 */
export function getCSP(): string {
  return `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https:;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co;
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
  `
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Obfuscates sensitive data for logging
 * @param data Data containing sensitive information
 * @returns Obfuscated data safe for logging
 */
export function obfuscateSensitiveData(data: any): any {
  if (!data) return data

  const sensitiveFields = ["password", "token", "secret", "key", "credit_card", "ssn", "social"]

  if (typeof data === "object" && data !== null) {
    const result = Array.isArray(data) ? [...data] : { ...data }

    for (const key in result) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        result[key] = "***REDACTED***"
      } else if (typeof result[key] === "object" && result[key] !== null) {
        result[key] = obfuscateSensitiveData(result[key])
      }
    }

    return result
  }

  return data
}
