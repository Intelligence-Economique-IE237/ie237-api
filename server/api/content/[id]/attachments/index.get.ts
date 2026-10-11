import { useDatabase } from "#server/utils/db.ts";
import { ContentNotFoundError } from "#server/utils/errors.ts";
import {
	contentExistsById,
	getPublishedContentAttachments,
} from "#server/utils/handlers/content.ts";
import { validateRouterZod } from "#server/utils/utils.ts";
import { defineHandler, defineRouteMeta } from "nitro";
import z from "zod";
const pathSchema = z.object({
	id: z.string().trim().pipe(z.uuid()),
});
export default defineHandler(async (event) => {
	const path = await validateRouterZod(event, pathSchema);

	const db = useDatabase();

	const exists = await contentExistsById(db, path.id);
	if (!exists) {
		throw new ContentNotFoundError(path.id);
	}

	return await getPublishedContentAttachments(db, path.id);
});
defineRouteMeta({
	openAPI: {
		operationId: 'getContentAttachments',
		method: "GET",
		tags: ["Content", "Attachments", 'Public APIs'],
		summary: "List content attachments",
		description: "Retrieve all attachments associated with a content item",
		parameters: [
			{
				name: "id",
				in: "path",
				required: true,
				description: "The content's unique identifier",
				schema: {
					type: "string",
					format: "uuid",
				},
			},
		],
		$global: {
			components: {
				schemas: {
					ContentAttachment: {
						type: "object",
						additionalProperties: false,
						properties: {
							urls: {
								type: "array",
								items: "string",
								default: [],
								description:
									"A list of resource urls which are attachments to this content posts",
							},
							content: {
								type: "string",
								format: "uuid",
								description:
									"The ID of the associated content post",
							},
							id: { type: "string" },
							name: { type: "string" },
						},
					},
				},
			},
		},
		responses: {
			200: {
				description: "Attachments retrieved successfully",
				content: {
					"application/json": {
						schema: {
							type: "array",
							items: {
								$ref: "#/components/schemas/ContentAttachment",
							},
						},
					},
				},
			},
			404: { $ref: "#/components/responses/ResourceNotFoundException" },
		},
	},
});
