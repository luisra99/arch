import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.url(),
    SUPABASE_URL: z.url(),
    REDIRECT_URL: z.url(),
    EMAIL_ADMIN_USER: z.email(),
    EMAIL_USER: z.email(),
    EMAIL_PASS: z.string(),
    CLIENT_ID: z.string(),
    CLIENT_SECRET: z.string(),
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
    SUPABASE_BUCKET_NAME: z.string(),
    TOKEN_SECRET: z.string(),
    SERVER_URL: z.url(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = _env.data;