import { useDatabase } from "#server/utils/db.ts";
import {
	ContentAttachmentConflictError,
	ContentNotFoundError,
} from "#server/utils/errors.ts";
import {
	addContentAttachment,
	contentAttachmentExistsBySlug,
	contentExistsById,
} from "#server/utils/handlers/content.ts";
import { validateBodyZod, validateRouterZod } from "#server/utils/utils.ts";
import { defineHandler, defineRouteMeta } from "nitro";
import z from "zod";

const pathSchema = z.object({
	id: z.string().trim().pipe(z.uuid()),
});
const bodySchema = z.object({
	urls: z
		.string()
		.trim()
		.transform((v) => v.split(","))
		.pipe(z.url().array().nonempty()),
	name: z.string().trim().nonempty("An name must be provided"),
});
export default defineHandler(async (event) => {
	const path = await validateRouterZod(event, pathSchema);
	const body = await validateBodyZod(event, bodySchema);

	const db = useDatabase();
	const exists = await contentExistsById(db, path.id);
	if (!exists) {
		throw new ContentNotFoundError(path.id);
	}

	const slug = z.string().slugify().parse(body.name);
	if (await contentAttachmentExistsBySlug(db, path.id, slug)) {
		throw new ContentAttachmentConflictError(slug, path.id);
	}
	await db.transaction(async (tx) => {
		await addContentAttachment(tx, {
			content: path.id,
			urls: body.urls,
			name: body.name,
			slug,
		});
	});
	event.res.status = 201;
});

defineRouteMeta({
	openAPI: {
		summary: "Add Attachment",
		description: "Add an attachment to a content post",
		operationId: "addContentAttachment",
		tags: ["Content", "Attachments"],
		parameters: [
			{
				in: "path",
				required: "true",
				name: "id",
				schema: { type: "string", format: "uuid" },
			},
		],
		requestBody: {
			description: "Request payload",
			required: true,
			content: {
				"application/json": {
					schema: {
						type: "object",
						additionalProperties: false,
						required: ["urls", "name"],
						properties: {
							urls: {
								type: "array",
								items: "string",
								description:
									"A list of URLs to attach to the content",
							},
							name: {
								type: "string",
								description:
									"The name of the group of attachments",
							},
						},
					},
				},
			},
		},
		responses: {
			404: { $ref: "#/components/responses/ResourceNotFoundException" },
			400: { $ref: "#/components/responses/BadRequestException" },
			201: { description: "The attachment was created successfully" },
		},
	},
});
