import {
	Counter,
	Histogram,
	Pushgateway,
	Registry,
} from "@prometheus-io/client";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { useRuntimeConfig } from "nitro/runtime-config";
import { fileURLToPath } from "node:url";
import { useLogger } from "./logging";

let gateway: ReturnType<typeof createGateway>;
let pushTimer: NodeJS.Timeout;
const registry = new Registry();
registry.setDefaultLabels({ app: "ie237-api" });

const requestCounter = new Counter({
	name: "http_requests_total",
	help: "Total number of HTTP requests received",
	labelNames: [
		"method",
		"url",
		"status_code",
		"ip",
		"host",
		"query",
		"environment",
		"scheme",
	] as const,
	registers: [registry],
});
const requestTimer = new Histogram({
	name: "http_request_duration_seconds",
	help: "Duration of HTTP requests in seconds",
	labelNames: [
		"method",
		"url",
		"status_code",
		"ip",
		"host",
		"query",
		"environment",
		"scheme",
	] as const,
	buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
	registers: [registry],
});

export function initMetrics() {
	const logger = useLogger({
		module: "metrics",
		modulePath: fileURLToPath(import.meta.url),
	});
	
	if (import.meta.dev) {
		if (gateway) return;
		logger.debug("initializing metrics gateway");
		gateway = createGateway();
		logger.debug("metrics gateway initialized");
	}
}

export async function pushMetrics() {
	await gateway.push({ jobName: "ie237-api" });
}

export function useRequestCounter() {
	return requestCounter;
}

export function useRequestTimer() {
	return requestTimer;
}

function createGateway() {
	const { prometheusUrl, prometheusPushUrl } = useRuntimeConfig();

	return new Pushgateway(
		prometheusPushUrl,
		{
			agent: new (prometheusUrl.startsWith("https")
				? HttpsAgent
				: HttpAgent)({
				keepAlive: true,
				keepAliveMsecs: 10000,
				maxFreeSockets: 5,
			}),
		},
		registry,
	);
}

export function useMetricsRegistry() {
	return registry;
}

