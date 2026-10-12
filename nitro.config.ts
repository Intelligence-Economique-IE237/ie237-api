import { defineConfig } from "nitro";

const compatibilityDate = "2026-10-06";

export default defineConfig({
	preset: 'node-server',
	experimental: {
		envExpansion: true,
		openAPI: true,
		// tasks: true,
	},
	serverDir: "./server",
	compatibilityDate,
	runtimeConfig: {
		dbUrl: "",
		siteOrigin: "http://localhost:3000",
		lokiOrigin: "http://localhost:3100",

		minioHost: "",
		minioPort: 9000,
		minioSecretKey: "",
		minioAccessKey: "",
		minioUseSsl: false,
		minioBucket: "",

		prometheusUrl: "",
		prometheusPushUrl: "",
	},
	openAPI: {
		route: "/_docs/openapi.json",
		meta: { title: "IE237 API", version: "1.0.0" },
		ui: {
			swagger: false,
			scalar: {
				route: "/_docs/scalar",
			},
		},
	},
	routeRules: {
		"/api/v1/content/blogs": {
			static: true,
			cache: {
				maxAge: 3600 * 24 * 7 * 4,
			},
		},
		"/api/v1/**": {
			cors: true,
			headers: {
				"access-control-allow-methods":
					"GET, PUT, POST, DELETE, PATCH, OPTIONS",
			},
		},
	},
});
