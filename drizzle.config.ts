import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// const url = new URL(String(process.env.NITRO_DB_URL));

export default defineConfig({
	dialect: "postgresql",
	dbCredentials: {
		url: String(process.env.NITRO_DB_URL),
	},
	schema: 'server/database/schema.ts',
	out: 'migrations'
});
