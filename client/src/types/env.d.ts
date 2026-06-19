declare namespace NodeJS {
  interface ProcessEnv {
    // Email configuration
    EMAIL_HOST?: string
    EMAIL_PORT?: string
    EMAIL_SECURE?: string
    EMAIL_USER?: string
    EMAIL_PASSWORD?: string
    EMAIL_FROM?: string
    EMAIL_TO?: string

    // Application URL
    NEXT_PUBLIC_APP_URL?: string

    // Database
    POSTGRES_URL?: string
    SUPABASE_URL?: string
    SUPABASE_ANON_KEY?: string
    SUPABASE_SERVICE_ROLE_KEY?: string
  }
}
