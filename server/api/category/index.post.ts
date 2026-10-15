import { useDatabase } from "#server/utils/db.ts";
import { createCategory } from "#server/utils/handlers/category.ts";
import { useQueue } from "#server/utils/queue.ts";
import { validateBodyZod } from "#server/utils/utils.ts";
import { getRequestHost, getRequestProtocol } from "h3";
import { defineHandler, defineRouteMeta } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";
import { z } from "zod";

// Schema for category creation
const categoryCreateSchema = z
	.object({
		name: z.string().trim().nonempty("Name is required"),
		description: z.string().trim().optional(),
	})
	.transform((v) => ({ ...v, slug: z.string().slugify().parse(v.name) }));

// POST /api/category - Create new category
export default defineHandler(async (event) => {
	const body = await validateBodyZod(event, categoryCreateSchema);

	const db = useDatabase();

	// Use service handler to create category (within transaction)
	const newCategory = await db.transaction(async (tx) => {
		return await createCategory(tx, {
			slug: body.slug,
			title: body.name,
			description: body.description,
		});
	});
	const { siteOrigin } = useRuntimeConfig();
	const queue = useQueue("category");
	event.res.headers.set(
		"location",
		`${getRequestProtocol(event, { xForwardedProto: true })}://${getRequestHost(event, { xForwardedHost: true })}/api/category/${newCategory.slug}`,
	);
	event.res.status = 201;
	queue.add("create", { slug: newCategory.slug });
});

// Define OpenAPI metadata for this route (top-level function, not passed to defineHandler)
defineRouteMeta({
	openAPI: {
		opeartionId: "createCategory",
		tags: ["Category"],
		summary: "Create category",
		description: "Create a new category",
		requestBody: {
			description: "Category creation payload",
			content: {
				"application/json": {
					schema: {
						type: "object",
						additionalProperties: false,
						required: ["name"],
						properties: {
							name: { type: "string" },
							description: { type: "string" },
						},
					},
				},
			},
		},
		responses: {
			400: { $ref: "#/components/responses/BadRequestException" },
			409: { $ref: "#/components/responses/ConflictException" },
			201: {
				description: "The category was successfully created",
				headers: {
					Location: {
						description: "The location of the new category",
						type: "string",
					},
				},
			},
		},
	},
});
