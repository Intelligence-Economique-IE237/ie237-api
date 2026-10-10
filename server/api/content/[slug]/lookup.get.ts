import { useDatabase } from "#server/utils/db.ts";
import { lookupPublishedContentById } from "#server/utils/handlers/content.ts";
import { defineHandler, defineRouteMeta, HTTPError } from "nitro";
import { getValidatedRouterParams } from "nitro/h3";
import { z } from "zod";

// Schema for URL parameter validation
const pathSchema = z.object({
	id: z.string().trim().pipe(z.uuid()),
});

// GET /api/content/:id - View single content item
export default defineHandler(async (event) => {
	const { data, success, error } = await getValidatedRouterParams(
		event,
		pathSchema.safeParse,
	);
	if (!success) {
		throw new HTTPError(z.prettifyError(error), { status: 400 });
	}
	const { id } = data;

	const db = useDatabase();
	const content = await lookupPublishedContentById(db, id);

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
		operationId: "lookupPublishedContentById",
		tags: ["Content"],
		summary: "Lookup content",
		parameters: [
			{
				name: "id",
				in: "path",
				required: true,
				schema: {
					type: "string",
					format: "uuid",
				},
				description: "Content id identifier",
			},
		],
		responses: {
			404: {
				description: "The content does not exist",
				content: {
					"application/json": {
						description: "Error payload",
						schema: {
							$ref: "#/components/schemas/ErrorPayload",
						},
					},
				},
			},
			400: {
				description: "The request was invalid",
				content: {
					"application/json": {
						description: "Error payload",
						schema: {
							$ref: "#/components/schemas/ErrorPayload",
						},
					},
				},
			},
			200: {
				description: "Content item retrieved successfully",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/ContentLookup" },
					},
				},
			},
		},
	},
});
