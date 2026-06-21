// QQCatalyst configuration - Updated with React app patterns
export const QQ_CONFIG = {
  CLIENT_ID: process.env.QQ_CLIENT_ID || process.env.NEXT_PUBLIC_QQ_CLIENT_ID || "44c42186-4bd4-40c0-b681-d2ad2f5db414",
  CLIENT_SECRET: process.env.QQ_CLIENT_SECRET || "",
  USERNAME: process.env.QQ_USERNAME || "",
  PASSWORD: process.env.QQ_PASSWORD || "",
  TOKEN_URL: process.env.QQ_TOKEN_URL || "https://login.qqcatalyst.com/oauth/token",
  BASE_URL: process.env.QQ_BASE_URL || process.env.QQ_API_BASE || "http://api.qqcatalyst.com/v1",
  OAUTH_URL: process.env.QQ_OAUTH_URL || "https://login.qqcatalyst.com/oauth/authorize",
  // Use the same client ID as the React app for consistency
  OAUTH_CLIENT_ID: "44c42186-4bd4-40c0-b681-d2ad2f5db414",
}

// Validate configuration
export function validateQQConfig() {
  const missing = []

  if (!QQ_CONFIG.CLIENT_ID) missing.push("QQ_CLIENT_ID")
  if (!QQ_CONFIG.CLIENT_SECRET) missing.push("QQ_CLIENT_SECRET")
  if (!QQ_CONFIG.USERNAME) missing.push("QQ_USERNAME")
  if (!QQ_CONFIG.PASSWORD) missing.push("QQ_PASSWORD")

  if (missing.length > 0) {
    throw new Error(`Missing QQCatalyst environment variables: ${missing.join(", ")}`)
  }

  return true
}

export function getQQConfig() {
  validateQQConfig()
  return QQ_CONFIG
}

// OAuth configuration
export const OAUTH_CONFIG = {
  authUrl: "https://login.qqcatalyst.com/oauth/authorize",
  tokenUrl: "https://login.qqcatalyst.com/oauth/token",
  clientId: "44c42186-4bd4-40c0-b681-d2ad2f5db414",
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/qqcatalyst/callback`,
  scope: "read write",
}
