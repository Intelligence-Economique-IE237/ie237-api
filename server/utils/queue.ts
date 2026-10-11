import { createPostgresBackend, Queue, runMigrations } from "bullmq";
import { getPool } from "./db";
import { QueueKeys } from "#server/utils/constants.ts";

export async function initQueue() {
	const pool = getPool();
	const client = await pool.connect();
	try {
		await runMigrations(client);
	} finally {
		client.release();
	}
}

const queues = new Map<string, ReturnType<typeof makeQueue>>();
export function useQueue(name: keyof typeof QueueKeys) {
	return queues.getOrInsertComputed(QueueKeys[name], makeQueue);
}

function makeQueue(name: string) {
	return new Queue(name, { connection: getPool() }, createPostgresBackend);
}
