import { useDatabase } from "#server/utils/db.ts";
import {
	findPublishedContent,
	getPublishedContentStats,
} from "#server/utils/handlers/content.ts";
import { defineHandler, defineRouteMeta, HTTPError } from "nitro";
import { getValidatedQuery } from "nitro/h3";
import z, { prettifyError } from "zod";

const querySchema = z.object({
	query: z.string().trim().optional(),
	page: z.coerce.number().positive("Must be greater than zero").default(0),
	size: z.coerce.number().positive("Must be greater than zero").default(5),
});
export default defineHandler(async (event) => {
	const { error, data, success } = await getValidatedQuery(
		event,
		querySchema.safeParse,
	);
	if (!success) {
		throw new HTTPError(prettifyError(error), { status: 400 });
	}

	const db = useDatabase();
	const d = await findPublishedContent(db, data.page, data.size, data.query);
	const { totalRecords } = await getPublishedContentStats(db);
	const totalPages = Math.ceil(totalRecords / data.size);
	return {
		totalRecords,
		hasNext: data.page < totalPages,
		hasPrevious: data.page > 0,
		totalPages,
		data: d,
	};
});

defineRouteMeta({
	openAPI: {
		tags: ["Content"],
		operationId: 'lookupContent',
		summary: "Get content",
		description: "Get content posts",
		parameters: [
			{
				in: "query",
				name: "query",
				description: "A search filter",
			},
			{
				name: "page",
				in: "query",
				description: "The pagination page offset",
				schema: { type: "number", min: 0 },
			},
			{
				name: "size",
				in: "query",
				description: "The pagination page size",
				schema: { type: "number", min: 0 },
			},
		],
		$global: {
			components: {
				schemas: {
					ContentLookup: {
						type: "object",
						additionalProperties: false,
						required: [
							"type",
							"slug",
							"title",
							"createdAt",
							"updatedAt",
							"id",
							"status",
							"language",
							"excerpt",
							"isTranslationOf",
							"category",
							"attachments",
						],
						properties: {
							type: {
								type: "string",
								enum: ["news", "blog"],
							},
							slug: {
								type: "string",
							},
							title: {
								type: "string",
							},
							tags: {
								type: "array",
								nullable: true,
								items: {
									type: "string",
								},
							},
							createdAt: {
								type: "string",
								format: "date-time",
							},
							updatedAt: {
								type: "string",
								format: "date-time",
							},
							id: {
								type: "string",
							},
							status: {
								type: "string",
								enum: ["draft", "published"],
							},
							language: {
								type: "string",
							},
							excerpt: {
								type: "string",
								nullable: true,
							},
							isTranslationOf: {
								type: "string",
								nullable: true,
							},
							category: {
								type: "string",
								nullable: true,
							},
							attachments: {
								type: "array",
								items: {
									type: "object",
									required: ["urls"],
									properties: {
										urls: {
											type: "array",
											items: {
												type: "string",
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
		responses: {
			200: {
				description: "A paginated slice of content",
				content: {
					"application/json": {
						schema: {
							type: "array",
							items: {
								$ref: "#/components/schemas/ContentLookup",
							},
						},
					},
				},
			},
		},
	},
});
