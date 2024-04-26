import "dotenv/config";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { connection, db } from "./src/backend/db/db.js";

migrate(db, { migrationsFolder: "./drizzle" }).then(() => connection.end());
