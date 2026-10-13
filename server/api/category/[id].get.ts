import { useDatabase } from "#server/utils/db.ts"
import { defineHandler } from "nitro"
import { defineRouteMeta } from "nitro"

// GET /api/category/[id] - Get category by ID
export default defineHandler(async (event) => {
	const { id } = await event.context.params

	const db = useDatabase()

	// TODO: Fetch category from database using drizzle ORM
	// const { data } = await db.select().from(categories).where(eq(categories.id, id))

	// Mock response for foundation phase
	const mockCategory = {
		id,
		name: "Sample Category",
		description: "Sample category description",
		slug: "sample-category",
	}

	return {
		success: true,
		data: mockCategory,
	}
})

// Define OpenAPI metadata for this route
defineRouteMeta({
	openAPI: {
		method: "GET",
		tags: ["Category"],
		summary: "Get category by ID",
		description: "Retrieve a category by its unique identifier",
		parameters: [
			{
				name: "id",
				in: "path",
				required: true,
				description: "The category's unique identifier",
				schema: { type: "string", format: "uuid" },
			},
		],
		responses: {
			200: {
				description: "Category retrieved successfully",
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								success: { type: "boolean" },
								data: {
									type: "object",
									properties: {
										id: { type: "string" },
										name: { type: "string" },
										description: { type: "string" },
										slug: { type: "string" },
									},
								},
							},
							required: ["success", "data"],
						},
					},
				},
			},
			404: {
				description: "Category not found",
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
})