import { closeDbPool, initDbPool } from "#server/utils/db.ts";
import { useLogger } from "#server/utils/logging.ts";
import { definePlugin } from "nitro";

export default definePlugin((app) => {
	const logger = useLogger({ module: "db-plugin" });
	logger.debug("opening database pool");
	initDbPool();
	app.hooks.hook("close", async () => {
		logger.debug("closing database pool");
		await closeDbPool();
	});
});
