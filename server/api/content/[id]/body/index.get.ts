import { useDatabase } from "#server/utils/db.ts";
import { getContentBody } from "#server/utils/handlers/content.ts";
import { validateRouterZod } from "#server/utils/utils.ts";
import { defineHandler, defineRouteMeta } from "nitro";
import z from "zod";

const paramsSchema = z.object({
	id: z.string().trim().pipe(z.uuid()),
});
export default defineHandler(async (event) => {
	const { id } = await validateRouterZod(event, paramsSchema);

	const db = useDatabase();
	const result = await getContentBody(db, id);
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
				description: "The id of the content post",
				schema: { type: "string", format: "uuid" },
				required: true,
				in: "path",
			},
		],
		summary: "Get body",
		description: "Get the body of a published content post",
		tags: ["Content", "Public APIs"],
		operationId: "getContentBody",
	},
});
