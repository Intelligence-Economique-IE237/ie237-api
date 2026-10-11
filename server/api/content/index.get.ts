import { useDatabase } from "#server/utils/db.ts";
import {
	lookupPublishedContent,
	getPublishedContentStats,
} from "#server/utils/handlers/content.ts";
import { defineHandler, defineRouteMeta, HTTPError } from "nitro";
import { getValidatedQuery } from "nitro/h3";
import z, { prettifyError } from "zod";

const querySchema = z.object({
	query: z.string().trim().optional(),
	page: z.coerce.number().min(0).default(0),
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
	const d = await lookupPublishedContent(
		db,
		data.page,
		data.size,
		data.query,
	);
	const { totalRecords } = await getPublishedContentStats(db);
	const totalPages = Math.ceil(totalRecords / data.size);
	return {
		totalRecords,
		hasNext: data.page < (totalPages-1),
		firstPage: 0,
		lastPage: totalPages - 1,
		hasPrevious: data.page > 0,
		totalPages,
		data: d,
	};
});

defineRouteMeta({
	openAPI: {
		tags: ["Content", 'Public APIs'],
		operationId: "lookupPublishedContent",
		summary: "Lookup all content",
		description: "Lookup content posts",
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
				schema: { type: "number", min: 0, default: 0 },
			},
			{
				name: "size",
				in: "query",
				description: "The pagination page size",
				schema: { type: "number", min: 0, default: 10 },
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
							"priority",
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
							// tags: {
							// 	type: "array",
							// 	nullable: true,
							// 	items: {
							// 		type: "string",
							// 	},
							// },
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
								format: "uuid",
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
							priority: { type: "number" },
							// attachments: {
							// 	type: "array",
							// 	items: {
							// 		type: "object",
							// 		required: ["urls"],
							// 		properties: {
							// 			urls: {
							// 				type: "array",
							// 				items: {
							// 					type: "string",
							// 				},
							// 			},
							// 		},
							// 	},
							// },
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
							type: "object",
							additionalProperties: false,
							required: [
								"totalRecords",
								"hasNext",
								"hasPrevious",
								"totalPages",
								"firstPage",
								"lastPage",
								"data",
							],
							properties: {
								totalRecords: {
									type: "number",
									minimum: 0,
									description:
										"The total number of content posts matching the filters",
								},
								hasNext: {
									type: "boolean",
									description:
										"Whether there's more pages after the current page",
								},
								hasPrevious: {
									type: "boolean",
									description:
										"Whether there's more pages before the current page",
								},
								totalPages: {
									type: "number",
									minimum: 1,
									description:
										"The total number of pages as specified in the query",
								},
								firstPage: {
									type: "number",
									description: "The first page index",
								},
								lastPage: {
									type: "number",
									description: "The last page index",
								},
								data: {
									description:
										"The slice of content post data",
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
		},
	},
});
