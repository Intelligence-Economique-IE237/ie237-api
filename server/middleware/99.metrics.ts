import {
	useRequestTimer,
	useRequestCounter as useVisitCounter,
} from "#server/utils/metrics.ts";
import { fromNodeHandler } from "h3/node";
import { useRuntimeConfig } from "nitro/runtime-config";

export default fromNodeHandler((req, res, next) => {
	if (req.url?.startsWith("/metrics") || req.url?.startsWith("/_"))
		return next();
	const { siteOrigin } = useRuntimeConfig();
	const url = new URL(req.url as string, siteOrigin);
	const counter = useVisitCounter();
	const end = useRequestTimer().startTimer();
	res.on("finish", () => {
		const labels = {
			environment: import.meta.dev ? "development" : "production",
			host: url.hostname,
			ip: req.socket.remoteAddress,
			method: req.method,
			query: [...url.searchParams.entries()]
				.map((entry) => entry.join("="))
				.join(","),
			scheme: url.protocol,
			status_code: res.statusCode,
			url: url.pathname,
		};
		end(labels);
		counter.inc(labels);
	});
	return next();
});
