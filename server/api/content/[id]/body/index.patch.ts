import { useDatabase } from "#server/utils/db.ts";
import { updateContentBody } from "#server/utils/handlers/content.ts";
import { defineRouteMeta } from "nitro";
import {
	defineHandler,
	getValidatedRouterParams,
	HTTPError,
	readBody,
} from "nitro/h3";
import z from "zod";

const paramsSchema = z.object({
	id: z.string().trim().pipe(z.uuid()),
});
const bodySchema = z.object({
	newContent: z.string().trim().nonempty(),
});
export default defineHandler(async (event) => {
	const { data, success, error } = await getValidatedRouterParams(
		event,
		paramsSchema.safeParse,
	);
	if (!success) {
		throw new HTTPError(z.prettifyError(error), { status: 400 });
	}

	const b = await readBody(event);
	const {
		data: body,
		success: bodyParsed,
		error: bodyError,
	} = bodySchema.safeParse(b);

	if (!bodyParsed) {
		throw new HTTPError(z.prettifyError(bodyError), { status: 400 });
	}

	const db = useDatabase();
	await db.transaction((tx) =>
		updateContentBody(tx, {
			content: body.newContent,
			id: data.id,
		}),
	);

	event.res.status = 202;
});

defineRouteMeta({
	openAPI: {
		responses: {
			404: {
				description: "The content post referenced does not exist",
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
			202: {
				description: "The content body was updated successfully",
			},
		},
		requestBody: {
			description: "The update payload",
			required: true,
			content: {
				"application/json": {
					schema: {
						type: "object",
						required: ["newContent"],
						additionalProperties: false,
						properties: {
							newContent: {
								type: "string",
								description:
									"The new body for the content post",
							},
						},
					},
				},
			},
		},
		parameters: [
			{
				name: "id",
				description: "The id of the content post",
				schema: { type: "string", format: "uuid" },
				required: true,
				in: "path",
			},
		],
		summary: "Update body",
		description: "Update the body of a content post",
		tags: ["Content"],
		operationId: "updateContentBody",
	},
});
