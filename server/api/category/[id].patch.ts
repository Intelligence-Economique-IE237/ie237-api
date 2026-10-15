import { useDatabase } from "#server/utils/db.ts";
import { ResourceConflictError } from "#server/utils/errors.ts";
import {
	categoryExistsById,
	updateCategory,
} from "#server/utils/handlers/category.ts";
import { useQueue } from "#server/utils/queue.ts";
import { validateBodyZod, validateRouterZod } from "#server/utils/utils.ts";
import { defineHandler, defineRouteMeta } from "nitro";
import { z } from "zod";

// Schema for path parameter validation
const pathSchema = z.object({
	id: z.string().trim().nonempty("ID is required"),
});

// Schema for category update
const categoryUpdateSchema = z.object({
	name: z.string().trim().nonempty("Name is required").optional(),
	description: z.string().trim().optional(),
	tags: z.string().trim().array().optional(),
});

export default defineHandler(async (event) => {
	const path = await validateRouterZod(event, pathSchema);
	const body = await validateBodyZod(event, categoryUpdateSchema);
	const db = useDatabase();

	let slug: string | undefined = undefined;
	if (body.name) {
		slug = z.string().slugify().parse(body.name);
	}
	const updatedCategory = await db.transaction(async (tx) => {
		if (slug) {
			const exists = await categoryExistsById(tx, slug);
			if (exists)
				throw new ResourceConflictError(
					`A category with the specified name already exists`,
				);
		}
		return await updateCategory(tx, path.id, {
			title: body.name,
			tags: body.tags,
			description: body.description,
			newSlug: slug,
		});
	});
	const queue = useQueue("category");
	const args: Record<string, any> = { keys: Object.keys(body) };
	if (slug) {
		args["newSlug"] = slug;
		args["oldSlug"] = path.id;
	}
	queue.add(`update:${slug ?? path.id}`, args);
	event.res.status = 202;
	return updatedCategory;
});

// Define OpenAPI metadata for this route (top-level function, not passed to defineHandler)
defineRouteMeta({
	openAPI: {
		tags: ["Category"],
		operationId: "updateCategory",
		summary: "Update category",
		description: "Update a category by its unique identifier (slug)",
		parameters: [
			{
				name: "id",
				in: "path",
				required: true,
				description: "The category's unique identifier (slug)",
				schema: { type: "string" },
			},
		],
		requestBody: {
			description: "Category update payload",
			content: {
				"application/json": {
					schema: {
						type: "object",
						additionalProperties: false,
						required: ["name,description", "tags"],
						properties: {
							name: { type: "string" },
							description: { type: "string", nullable: true },
							tags: {
								type: "array",
								items: "string",
								default: [],
							},
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
							additionalProperties: false,
							required: [
								"slug",
								"title",
								"createdAt",
								"updatedAt",
							],
							properties: {
								slug: {
									type: "string",
								},
								title: {
									type: "string",
								},
								tags: {
									type: "array",
									items: {
										type: "string",
									},
									nullable: true,
								},
								description: {
									type: "string",
									nullable: true,
								},
								createdAt: {
									type: "string",
									format: "date-time",
								},
								updatedAt: {
									type: "string",
									format: "date-time",
								},
							},
						},
					},
				},
			},
			400: {
				$ref: "#/components/responses/BadRequestException",
			},
			404: {
				$ref: "#/components/responses/ResourceNotFoundException",
			},
			409: { $ref: "#/components/responses/ConflictException" },
		},
	},
});
