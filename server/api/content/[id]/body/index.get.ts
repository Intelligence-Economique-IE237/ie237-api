import { useDatabase } from "#server/utils/db.ts";
import { getContentBody } from "#server/utils/handlers/content.ts";
import { defineHandler, defineRouteMeta, HTTPError } from "nitro";
import { getValidatedRouterParams } from "nitro/h3";
import z from "zod";

const paramsSchema = z.object({
	id: z.string().trim().pipe(z.uuid()),
});
export default defineHandler(async (event) => {
	const { data, success, error } = await getValidatedRouterParams(
		event,
		paramsSchema.safeParse,
	);

	if (!success) {
		throw new HTTPError(z.prettifyError(error), { status: 400 });
	}

	const db = useDatabase();
	const result = await getContentBody(db, data.id);
	return result?.content;
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
			200: {
				description: "OK",
				content: {
					"text/plain": {
						schema: {
							type: "string",
							required: true,
						},
					},
				},
			},
		},
		parameters: [
			{
				name: "id",
				description: 'The id of the content post',
				schema: { type: "string", format: "uuid" },
				required: true,
				in: "path",
			},
		],
		summary: "Get body",
		description: "Get the body of a content post",
		tags: ["Content"],
		operationId: "getContentBody",
	},
});
