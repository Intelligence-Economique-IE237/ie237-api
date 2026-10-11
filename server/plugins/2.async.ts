import { useLogger } from "#server/utils/logging.ts";
import { initQueue } from "#server/utils/queue.ts";
import { definePlugin } from "nitro";

export default definePlugin(async (app) => {
	const logger = useLogger({ module: "async-plugin" });
	logger.debug("initializing job queues");
	await initQueue();
});
