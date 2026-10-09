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

	// TODO: Fetch from database using drizzle ORM
	// const { data } = await db.select().from(content).where(sql.eq(content.slug, slug))

	// Mock response for foundation phase
	const mockContent = {
		id: 1,
		title: `Sample ${slug} Content`,
		slug: slug,
		type: "news" as const,
		status: "published" as const,
		content: `# ${slug.replace(/-/g, " ")} Title\n\nThis is sample content for the ${slug} endpoint.`,
		excerpt: `Excerpt for ${slug} - a sample summary`,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};

	return {
		success: true,
		data: mockContent,
	};
});


defineRouteMeta({
	openAPI: {
		method: "GET",
		tags: ["Content"],
		summary: "View single content item by slug",
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
										created_at: {
											type: "string",
											format: "date-time",
										},
										updated_at: {
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
