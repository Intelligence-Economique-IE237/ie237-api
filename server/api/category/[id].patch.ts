import { useDatabase } from "#server/utils/db.ts"
import { defineHandler } from "nitro"
import { defineRouteMeta, HTTPError } from "nitro"
import { z } from "zod"

// Schema for path parameter validation
const pathSchema = z.object({
	id: z.string().trim().nonempty("ID is required"),
})

// Schema for category update
const categoryUpdateSchema = z.object({
	name: z.string().trim().nonempty("Name is required").optional(),
	description: z.string().trim().optional(),
	slug: z.string().trim().regex(/^[a-z0-9]+(?:[_-]?[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens or underscores").optional(),
})

// PATCH /api/category/[id] - Update category
export const updateCategory = defineHandler(async (event) => {
	const { id } = await event.context.params
	const body = await event.context.json // validateRouter(categoryUpdateSchema.safeParse)

	if (!success) {
		throw new HTTPError(prettifyError(error), { status: 400 })
	}

	const db = useDatabase()

	// TODO: Update category in database using drizzle ORM
	// await db.update(categories).set({ name, description, slug }).where(eq(categories.id, id))

	// Mock response for foundation phase
	const mockCategory = {
		id,
		name: body.name || "Updated Category",
		description: body.description,
		slug: body.slug,
	}

	return {
		success: true,
		data: mockCategory,
	}
})

// Define OpenAPI metadata for this route
defineRouteMeta({
	openAPI: {
		method: "PATCH",
		tags: ["Category"],
		summary: "Update category",
		description: "Update a category by its unique identifier",
		parameters: [
			{
				name: "id",
				in: "path",
				required: true,
				description: "The category's unique identifier",
				schema: { type: "string", format: "uuid" },
			},
		],
		requestBody: {
			description: "Category update payload",
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
			200: {
				description: "Category updated successfully",
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