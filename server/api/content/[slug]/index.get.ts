import { useDatabase } from "#server/utils/db.ts";
import { findPublishedContentBySlug } from "#server/utils/handlers/content.ts";
import { defineHandler, defineRouteMeta, HTTPError } from "nitro";
import { getValidatedRouterParams } from "nitro/h3";
import { prettifyError, z } from "zod";

// Schema for URL parameter validation
const slugSchema = z.object({
	slug: z
		.string()
		.min(1, "Slug must not be empty")
		.regex(
			/^[a-z0-9]+(?:[_-]?[a-z0-9]+)*$/,
			"Slug must be lowercase alphanumeric with hyphens or underscores",
		),
});

// GET /api/content/:slug - View single content item
export default defineHandler(async (event) => {
	const { data, success, error } = await getValidatedRouterParams(
		event,
		slugSchema.safeParse,
	);
	if (!success) {
		throw new HTTPError(prettifyError(error), { status: 400 });
	}
	const { slug } = data;

	const db = useDatabase();
	const content = await findPublishedContentBySlug(db, slug);

	if (!content) {
		throw new HTTPError("Content not found or has been deleted", {
			status: 404,
		});
	}

	return content;
});

defineRouteMeta({
	openAPI: {
		method: "GET",
		operationId: 'lookupContentBySlug',
		tags: ["Content"],
		summary: "Get Content Post",
		parameters: [
			{
				name: "slug",
				in: "path",
				required: true,
				schema: {
					type: "string",
					minLength: 1,
					pattern: "^[a-z0-9]+(?:[_-]?[a-z0-9]+)*$",
				},
				description: "Content slug identifier",
			},
		],
		responses: {
			200: {
				description: "Content item retrieved successfully",
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								success: { type: "boolean" },
								data: {
									type: "object",
									properties: {
										id: { type: "integer" },
										title: { type: "string" },
										slug: { type: "string" },
										type: { type: "string" },
										status: { type: "string" },
										content: { type: "string" },
										excerpt: { type: "string" },
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
							required: ["success", "data"],
						},
					},
				},
			},
			400: {
				description: "Invalid slug parameter",
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
});
