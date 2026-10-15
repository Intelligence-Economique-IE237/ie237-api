import { initMetrics } from "#server/utils/metrics.ts";
import { definePlugin } from "nitro";

export default definePlugin((app) => {
	initMetrics();
});
