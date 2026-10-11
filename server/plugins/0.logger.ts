import { initLogging, useLogger } from "#server/utils/logging.ts";
import { definePlugin } from "nitro";
import { fileURLToPath } from "url";

export default definePlugin((app) => {
	initLogging();
	const logger = useLogger({
		module: "logger-plugin",
		modulePath: fileURLToPath(import.meta.url),
	});
	app.hooks.hook("request", (event) => {
		logger.info({
			message: "Incoming request",
			method: event.req.method,
			url: event.req.url,
		});
	});

	app.hooks.hook("error", (error, { event }) => {
		logger.error({
			message: "Server caught error",
			error: error.message,
			stack: error.stack,
			url: event?.req.url,
		});
	});
});
