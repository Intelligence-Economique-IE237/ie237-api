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
		method: "GET",
		tags: ["Content", "Attachments"],
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
		responses: {
			200: {
				description: "Attachments retrieved successfully",
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								success: { type: "boolean" },
								data: {
									type: "array",
									items: {
										type: "object",
										properties: {
											id: { type: "string" },
											name: { type: "string" },
											type: { type: "string" },
											size: { type: "integer" },
											url: { type: "string" },
											created_at: {
												type: "string",
												format: "date-time",
											},
										},
									},
								},
							},
							required: ["success", "data"],
						},
					},
				},
			},
			404: {
				description: "Content not found",
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
