import { defineConfig } from "nitro";

const compatibilityDate = "2026-10-06";

export default defineConfig({
	serverDir: "./server",
	compatibilityDate,
	runtimeConfig: {
		dbUrl: "",
	},
});
