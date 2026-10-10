import { drizzle } from "drizzle-orm/node-postgres";
import { useRuntimeConfig } from "nitro/runtime-config";
import { Pool } from "pg";
import { relations } from "../database/relations";

let pool: Pool;

export function initDb() {
	const { dbUrl } = useRuntimeConfig();
	const url = new URL(dbUrl);
	pool = new Pool({
		host: url.hostname,
		password: url.password,
		user: url.username,
		ssl: ["require", "prefer"].includes(
			url.searchParams.get("sslmode") || "",
		),
		database: url.pathname.substring(1),
		application_name: "ie237 api",
		port: Number(url.host.split(":")[0] || "5432"),
	});
}

export function useDatabase() {
	return drizzle({
		client: pool,
		logger: import.meta.dev === true,
		relations,
	});
}

export type Connection = ReturnType<typeof useDatabase>;
export type Transaction = Parameters<
	Parameters<Connection["transaction"]>[0]
>[0];
export type ConnectionLike = Connection | Transaction;
