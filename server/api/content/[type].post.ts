import { useDatabase } from "#server/utils/db.ts";
import { createContent } from "#server/utils/handlers/content.ts";
import { determineLanguage } from "#server/utils/nlp.ts";
import { defineHandler, defineRouteMeta, HTTPError } from "nitro";
import { getValidatedRouterParams, readBody } from "nitro/h3";
import z from "zod";

const bodySchema = z.object({
	title: z.string().trim().nonempty(),
	excerpt: z.string().trim().optional(),
});
const paramsSchema = z.object({
	type: z.enum(["news", "blog"]),
});
export default defineHandler(async (event) => {
	const {
		data: params,
		success: paramsParsed,
		error: paramsError,
	} = await getValidatedRouterParams(event, paramsSchema.safeParse);

	if (!paramsParsed) {
		throw new HTTPError(z.prettifyError(paramsError), { status: 400 });
	}
	const body = await readBody(event);
	const { data, error, success } = bodySchema.safeParse(body);
	if (!success) {
		throw new HTTPError(z.prettifyError(error), { status: 400 });
	}

	const db = useDatabase();
	const slug = z.string().slugify().parse(data.title.slice(0, 80));
	const lang = determineLanguage(data.title);
	const id = await db.transaction(async (tx) => {
		return createContent(tx, {
			language: lang,
			slug,
			title: data.title,
			type: params.type,
		});
	});
	event.res.status = 202;
	return { contentId: id };
});

defineRouteMeta({
	openAPI: {
		tags: ["Content"],
		summary: "Create content",
		operationId: "createContent",
		parameters: [
			{
				name: "type",
				schema: { type: "string", enum: ["news", "blog"] },
				description: "The type of content being created",
				in: "path",
				required: true,
			},
		],
		requestBody: {
			description: "Content creation payload",
			required: true,
			content: {
				"application/json": {
					schema: {
						type: "object",
						additionalProperties: false,
						required: ["title"],
						properties: {
							title: { type: "string" },
							excerpt: { type: "string" },
						},
					},
				},
			},
		},
		$global: {
			components: {
				schemas: {
					ErrorPayload: {
						type: "object",
						additionalProperties: false,
						required: ["error", "status"],
						properties: {
							error: { type: "boolean", enum: [true] },
							status: { type: "number", example: 400 },
							message: { type: "string" },
						},
					},
				},
			},
		},
		responses: {
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
			409: {
				description: "The content already exists with the same title",
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
				description:
					"The content was created successfully. But some processing is still on-going",
				content: {
					"application/json": {
						schema: {
							type: "objet",
							additionalProperties: false,
							required: ["contentId"],
							properties: {
								contentId: {
									type: "number",
									description: "The ID of the content",
								},
							},
						},
					},
				},
			},
		},
	},
});
