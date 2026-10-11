import { useDatabase } from "#server/utils/db.ts";
import { ContentNotFoundError } from "#server/utils/errors.ts";
import {
	contentExistsById,
	updateContent,
} from "#server/utils/handlers/content.ts";
import { useQueue } from "#server/utils/queue.ts";
import { validateBodyZod, validateRouterZod } from "#server/utils/utils.ts";
import { defineHandler, defineRouteMeta } from "nitro";
import z from "zod";

const pathSchema = z.object({
	id: z.string().trim().pipe(z.uuid()),
});
const bodySchema = z
	.object({
		excerpt: z.string().trim(),
		language: z.string().trim().max(2),
		tags: z.string().trim().array(),
		category: z.string().trim(),
		priority: z.int().min(0).max(10),
		type: z.enum(["news", "blog"]),
		title: z.string(),
	})
	.partial();

export default defineHandler(async (event) => {
	const path = await validateRouterZod(event, pathSchema);
	const body = await validateBodyZod(event, bodySchema);

	const db = useDatabase();
	const exists = await contentExistsById(db, path.id);
	if (!exists) {
		throw new ContentNotFoundError(path.id);
	}

	await db.transaction((tx) => updateContent(tx, path.id, body));
	const queue = useQueue("content");
	queue.add(`${path.id}:updated`, { keys: Object.keys(body) });
	event.res.status = 202;
});

defineRouteMeta({
	openAPI: {
		summary: "Update Content",
		operationId: "updateContentById",
		tags: ["Content"],
		description: "Update an existing content item by ID with new metadata and properties",
		parameters: [
			{
				name: "id",
				in: "path",
				required: true,
				description: "The unique identifier of the content to update",
				schema: {
					type: "string",
					format: "uuid",
				},
			},
		],
		requestBody: {
			description: "Content update payload",
			required: true,
			content: {
				"application/json": {
					schema: {
						type: "object",
						additionalProperties: false,
						properties: {
							title: {
								type: "string",
								description: "Content title",
							},
							excerpt: {
								type: "string",
								description: "Content excerpt/summary",
							},
							language: {
								type: "string",
								description: "ISO 639-1 language code (e.g., 'en', 'es')",
								maxLength: 2,
							},
							tags: {
								type: "array",
								items: {
									type: "string",
								},
								description: "Content tags/categories",
							},
							category: {
								type: "string",
								description: "Content category",
							},
							priority: {
								type: "integer",
								minimum: 0,
								maximum: 10,
								description: "Priority level (0-10, where 10 is highest)",
							},
							type: {
								type: "string",
								enum: ["news", "blog"],
								description: "Content type",
							},
						},
					},
				},
			},
		},
		responses: {
			202: {
				description: "Content was updated successfully. Processing may be asynchronous.",
				content: {
					"application/json": {
						schema: {
							type: "object",
							additionalProperties: false,
							required: ["contentId"],
							properties: {
								contentId: {
									type: "string",
									description: "The ID of the updated content",
								},
							},
						},
					},
				},
			},
			400: {
				description: "Invalid request body or parameters",
				content: {
					"application/json": {
						schema: {
							type: "object",
							additionalProperties: false,
							properties: {
								message: {
									type: "string",
									description: "Error message describing the validation failure",
								},
							},
						},
					},
				},
			},
			404: {
				description: "Content not found with the specified ID",
				content: {
					"application/json": {
						schema: {
							type: "object",
							additionalProperties: false,
							properties: {
								message: {
									type: "string",
									description: "Error message indicating the content was not found",
								},
							},
						},
					},
				},
			},
		},
	},
});
