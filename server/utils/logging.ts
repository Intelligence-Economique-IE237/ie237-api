import { useRuntimeConfig } from "nitro/runtime-config";
import { createLogger, format, transports, type Logger } from "winston";
import LokiTransport from "winston-loki";

let mainLogger: Logger;

export function initLogging() {
	if (!mainLogger) {
		const { lokiOrigin } = useRuntimeConfig();
		mainLogger = createLogger({
			transports: [
				new transports.Console({
					format: format.combine(
						format.timestamp(),
						format.cli(),
						format.colorize(),
					),
					level: import.meta.dev ? "debug" : "info",
				}),
				new LokiTransport({
					host: lokiOrigin,
					level: import.meta.dev ? "debug" : "info",
					labels: {
						app: "ie237-api",
						environment: import.meta.dev
							? "development"
							: "production",
					},
					json: true,
					// format: format.combine(format.timestamp(), format.json()),
					replaceTimestamp: true,
				}),
			],
		});
		mainLogger.debug("initialized logger");
	}
}

export function useLogger(meta?: Record<string, number | string>) {
	return mainLogger.child(meta || {});
}
