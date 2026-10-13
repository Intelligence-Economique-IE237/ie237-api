import { useDatabase } from "#server/utils/db.ts"
import { defineHandler } from "nitro"
import { z } from "zod"

// Schema for category creation
const categoryCreateSchema = z.object({
	name: z.string().trim().nonempty("Name is required"),
	description: z.string().trim().optional(),
	slug: z.string().trim().regex(/^[a-z0-9]+(?:[_-]?[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens or underscores").optional(),
})

// POST /api/category - Create new category
export const createCategory = defineHandler(async (event) => {
	const { name, description, slug } = await event.context.json // validateRouter(categoryCreateSchema.safeParse)

	if (!success) {
		throw new HTTPError(prettifyError(error), { status: 400 })
	}

	const db = useDatabase()

	// Use service handler to create category (within transaction)
	const newCategory = await db.transaction(async (tx) => {
		return await createCategory(tx, {
			title: name,
			description,
			slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
		})
	})

	return {
		success: true,
		data: newCategory,
	}
})

// Define OpenAPI metadata for this route (top-level function, not passed to defineHandler)
defineRouteMeta({
	openAPI: {
		method: "POST",
		tags: ["Category"],
		summary: "Create category",
		description: "Create a new category",
		requestBody: {
			description: "Category creation payload",
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							name: { type: "string" },
							description: { type: "string" },
							slug: { type: "string" },
						},
					},
				},
			},
		},
		responses: {
			201: {
				description: "Category created successfully",
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
			400: {
				description: "Invalid category data",
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