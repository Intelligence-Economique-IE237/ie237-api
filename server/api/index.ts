import { defineHandler } from "nitro"
import { defineRouteMeta } from "nitro"

export default defineHandler((event) => {
  return { message: "Hello from API!" };
}, defineRouteMeta({
	openAPI: {
		method: "GET",
		tags: ["Root"],
		summary: "Root API endpoint",
		description: "Root endpoint returning a welcome message",
		responses: {
			200: {
			description: "Welcome message",
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								message: { type: "string" },
							},
						},
					},
				},
			},
		},
	},
}))
