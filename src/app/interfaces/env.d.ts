declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    PORT: string;
    DATABASE_URL: string;
    SUPABASE_BUCKET_URL: string;
    SUPABASE_BUCKET_KEY: string;
    OWNER_FIRST_NAME: string;
    OWNER_EMAIL: string;
    OWNER_DEFAULT_PASS: string;
    OWNER_CONTACT_NUMBER: string;
    SALT_ROUNDS: string;
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRESIN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRESIN: string;
    EMAIL_ADDRESS: string;
    EMAIL_APP_PASS: string;
  }
}
