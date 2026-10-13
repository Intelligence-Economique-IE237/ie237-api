import { useDatabase } from "#server/utils/db.ts"
import { defineHandler, defineRouteMeta } from "nitro"

// GET /api/category - List all categories with pagination
export default defineHandler(async (event) => {
	const { data, success, error } = await getValidatedQuery(
		event,
		querySchema.safeParse,
	)
	if (!success) {
		throw new HTTPError(error, { status: 400 })
	}

	const db = useDatabase()

	// Use service handler to fetch categories with pagination
	const { data: categories, totalRecords } = await getCategories(
		db,
		data.page,
		data.size,
	)

	const totalPages = Math.ceil(totalRecords / data.size)

	return {
		totalRecords,
		page: data.page,
		size: data.size,
		hasNext: data.page < totalPages - 1,
		firstPage: 0,
		lastPage: totalPages - 1,
		hasPrevious: data.page > 0,
		totalPages,
		data: categories,
	}
})

// Define OpenAPI metadata for this route (top-level function, not passed to defineHandler)
defineRouteMeta({
	openAPI: {
		method: "GET",
		tags: ["Category"],
		summary: "List categories with pagination",
		description: "Retrieve a paginated list of all categories",
		parameters: [
			{
				name: "query",
				in: "query",
				description: "A search filter for categories",
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
				schema: { type: "number", minimum: 1, default: 10 },
			},
		],
		responses: {
			200: {
				description: "Categories retrieved successfully",
				content: {
					"application/json": {
						schema: {
							type: "object",
							additionalProperties: false,
							required: [
								"totalRecords",
								"page",
								"size",
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
										"The total number of categories matching the filters",
								},
								page: { type: "number", minimum: 0 },
								size: { type: "number", minimum: 1 },
								hasNext: { type: "boolean" },
								hasPrevious: { type: "boolean" },
								totalPages: {
									type: "number",
									minimum: 1,
									description:
										"The total number of pages as specified in the query",
								},
								firstPage: { type: "number", description: "The first page index" },
								lastPage: {
									type: "number",
									description: "The last page index",
								},
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
						},
					},
				},
			},
		},
	},
})