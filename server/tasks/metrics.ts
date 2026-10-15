import { useLogger } from "#server/utils/logging.ts";
import { pushMetrics } from "#server/utils/metrics.ts";
import { defineTask } from "nitro/task";
import { fileURLToPath } from "node:url";
import type { Logger } from "winston";

let logger: Logger;
export default defineTask({
	meta: {
		name: "metrics:push",
		description: "Push runtime metrics",
	},
	run: async ({ payload, context }) => {
		if (!logger) {
			logger = useLogger({
				module: "metrics-push-task",
				modulePath: fileURLToPath(import.meta.url),
			});
		}
		logger.debug("pushing metrics");
		try {
			await pushMetrics();
		} catch (e) {
			return { result: "failed", error: e };
		}
		return { result: "success" };
	},
});
