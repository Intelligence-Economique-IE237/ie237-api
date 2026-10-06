import { defineHandler } from "nitro";
import { defineRouteMeta } from "nitro";

export default defineHandler(async (event) => {
	event.res.headers.set("content-type", "application/xml");
}, defineRouteMeta({
	openAPI: {
		method: "GET",
		tags: ["RSS"],
		summary: "Get RSS feed",
		description: "Retrieve the RSS feed for the application",
		responses: {
			200: {
			description: "RSS feed XML content",
				content: {
					"application/xml": {
						schema: {
							type: "string",
						},
					},
				},
			},
		},
	},
}))
