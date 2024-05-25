import "dotenv/config";

import fs from "fs";
import { db } from "./src/backend/db/db.ts";
import tables from "./src/backend/db/tables.ts";

const data = JSON.parse(fs.readFileSync("data.json", "utf8"));

await db.delete(tables.users);
await db.insert(tables.users).values(data.users);

process.exit(0);
