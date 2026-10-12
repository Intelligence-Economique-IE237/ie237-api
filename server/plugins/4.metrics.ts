import {
	initMetrics,
	shutdownMetrics
} from "#server/utils/metrics.ts";
import { definePlugin } from "nitro";

export default definePlugin((app) => {
	initMetrics();
	app.hooks.hook("close", () => {
		shutdownMetrics();
	});
	// app.hooks.hook("response", (res, event) => {
	// 	const url = new URL(event.req.url);
	// 	if (
	// 		url.pathname.startsWith("/_") ||
	// 		url.pathname.startsWith("/metrics")
	// 	)
	// 		return;
	// 	try {
	// 		const counter = useRequestCounter();
	// 		counter
	// 			.labels({
	// 				method: event.req.method,
	// 				ip: String(event.req.ip),
	// 				status_code: res.status,
	// 				host: url.host,
	// 				url: url.pathname,
	// 				environment: import.meta.dev ? "development" : "production",
	// 				scheme: url.protocol,
	// 				query: [
	// 					...url.searchParams
	// 						.entries()
	// 						.map((pair) => pair.join("=")),
	// 				].join(","),
	// 			})
	// 			.inc();
	// 	} catch (e) {
	// 		const logger = useLogger({
	// 			module: "metrics-plugin",
	// 			modulePath: fileURLToPath(import.meta.url),
	// 		});
	// 		logger.error(e);
	// 	}
	// });
});
