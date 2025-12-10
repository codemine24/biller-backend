import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  app_name: "Biller",
  app_address: "Mouchak, Narayanganj, Bangladesh",
  node_env: process.env.NODE_ENV as string,
  port: process.env.PORT as string,
  database_url: process.env.DATABASE_URL as string,
  supabase_bucket_url: process.env.SUPABASE_BUCKET_URL as string,
  supabase_bucket_key: process.env.SUPABASE_BUCKET_KEY as string,
  owner_first_name: process.env.OWNER_FIRST_NAME as string,
  owner_email: process.env.OWNER_EMAIL as string,
  owner_default_pass: process.env.OWNER_DEFAULT_PASS as string,
  owner_contact_number: process.env.OWNER_CONTACT_NUMBER as string,
  salt_rounds: process.env.SALT_ROUNDS as string,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
  jwt_access_expiresin: process.env.JWT_ACCESS_EXPIRESIN as string,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
  jwt_refresh_expiresin: process.env.JWT_REFRESH_EXPIRESIN as string,
  email_address: process.env.EMAIL_ADDRESS as string,
  email_app_pass: process.env.EMAIL_APP_PASS as string,
};
