import { Counter, Pushgateway, Registry } from "@prometheus-io/client";
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

export function initMetrics() {
	if (gateway) return;
	const logger = useLogger({
		module: "metrics",
		modulePath: fileURLToPath(import.meta.url),
	});

	if (import.meta.dev) {
		logger.debug("initializing metrics gateway");
		gateway = createGateway();
		logger.debug("metrics gateway initialized");
		pushTimer = setInterval(async () => {
			try {
				await gateway.pushAdd({ jobName: "ie237-api" });
			} catch (err) {
				logger.error("failed to push metrics", err);
			}
		}, 10_000);
	}
}

export function useRequestCounter() {
	return requestCounter;
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

export function shutdownMetrics() {
	if (pushTimer) clearInterval(pushTimer);
}
