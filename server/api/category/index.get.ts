import { useDatabase } from "#server/utils/db.ts"
import { defineHandler } from "nitro"
import { getCategories } from "#server/utils/handlers/category"

// GET /api/category - List all categories
export default defineHandler(async (event) => {
	const db = useDatabase()

	// Use service handler to fetch categories
	const categories = await getCategories(db)

	// Mock response for foundation phase (replace with actual service call when DB is ready)
	const mockCategories = [
		{
			id: "cat-1",
			name: "News",
			description: "News categories",
			slug: "news",
		},
		{
			id: "cat-2",
			name: "Blog",
			description: "Blog categories",
			slug: "blog",
		},
	]

	return {
		success: true,
		data: categories.length > 0 ? categories : mockCategories,
	}
})

// Define OpenAPI metadata for this route (top-level function, not passed to defineHandler)
defineRouteMeta({
	openAPI: {
		method: "GET",
		tags: ["Category"],
		summary: "List categories",
		description: "Retrieve a list of all categories",
		responses: {
			200: {
				description: "Categories retrieved successfully",
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								success: { type: "boolean" },
								data: {
									type: "array",
									items: {
										type: "object",
										properties: {
											id: { type: "string" },
											name: { type: "string" },
											description: { type: "string" },
											slug: { type: "string" },
										},
									},
								},
							},
							required: ["success", "data"],
						},
					},
				},
			},
		},
	},
})