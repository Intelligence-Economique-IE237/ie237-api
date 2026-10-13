import { useDatabase } from "#server/utils/db.ts"
import { defineHandler } from "nitro"
import { z } from "zod"
import { getCategoryById } from "#server/utils/handlers/category"

// Schema for path parameter validation
const pathSchema = z.object({
	id: z.string().trim().nonempty("ID is required"),
})

// GET /api/category/[id] - Get category by ID
export default defineHandler(async (event) => {
	const { id } = await event.context.params

	const db = useDatabase()

	// Use service handler to get category by ID
	const category = await getCategoryById(db, id)

	return {
		success: true,
		data: category,
	}
}, defineRouteMeta({
	openAPI: {
		method: "GET",
		tags: ["Category"],
		summary: "Get category by ID",
		description: "Retrieve a category by its unique identifier (slug)",
		parameters: [
			{
				name: "id",
				in: "path",
				required: true,
				description: "The category's unique identifier (slug)",
				schema: { type: "string" },
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
}))