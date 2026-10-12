import { useMetricsRegistry } from "#server/utils/metrics.ts";
import { defineHandler } from "nitro";

export default defineHandler(async (event) => {
	const registry = useMetricsRegistry();
	event.res.headers.set("Content-Type", registry.contentType);
	return await registry.metrics();
});
