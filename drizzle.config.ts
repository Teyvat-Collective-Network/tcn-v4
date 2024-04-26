import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
    schema: "./src/backend/db/schemas.ts",
    out: "./drizzle",
    driver: "mysql2",
    dbCredentials: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASS,
        database: process.env.DATABASE_NAME,
    },
} satisfies Config;
