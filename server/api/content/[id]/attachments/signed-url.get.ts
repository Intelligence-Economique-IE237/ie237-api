import { useDatabase } from "#server/utils/db.ts";
import { ContentNotFoundError } from "#server/utils/errors.ts";
import { contentExistsById } from "#server/utils/handlers/content.ts";
import { prepareUploadURL } from "#server/utils/storage.ts";
import {
	randomName,
	validateQueryZod,
	validateRouterZod,
} from "#server/utils/utils.ts";
import { defineHandler, defineRouteMeta } from "nitro";
import z from "zod";

const pathSchema = z.object({
	id: z.string().trim().pipe(z.uuid()),
});
const querySchema = z.object({
	name: z.string().trim().optional().default(randomName),
});
export default defineHandler(async (event) => {
	const params = await validateQueryZod(event, querySchema);
	const pathVars = await validateRouterZod(event, pathSchema);

	const exists = await contentExistsById(useDatabase(), pathVars.id);
	if (!exists) {
		throw new ContentNotFoundError(pathVars.id);
	}
	const slug = z.string().slugify().parse(params.name);

	return await prepareUploadURL(`content/${pathVars.id}/attachments/${slug}`);
});

defineRouteMeta({
	openAPI: {
		tags: ["Content", "Attachments"],
		operationId: "getPresignedUploadUrl",
		summary: "Get upload URL",
		description: "Get a URl for uploading content attachment",
		parameters: [
			{
				in: "path",
				required: "true",
				name: "id",
				schema: { type: "string", format: "uuid" },
			},
			{
				in: "query",
				name: "name",
				type: { type: "string", default: "" },
			},
		],
		responses: {
			404: { $ref: "#/components/responses/ResourceNotFoundException" },
			400: { $ref: "#/components/responses/BadRequestException" },
			200: {
				description: "OK",
				content: {
					"application/json": {
						schema: {
							type: "object",
							additionalProperties: false,
							required: ["url", "method"],
							properties: {
								url: { type: "string" },
								method: {
									type: "string",
									enum: ["POST", "PUT"],
								},
							},
						},
					},
				},
			},
		},
	},
});
