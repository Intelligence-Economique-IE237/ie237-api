import { useDatabase } from "#server/utils/db.ts";
import { ContentNotFoundError } from "#server/utils/errors.ts";
import {
	contentExistsById,
	setContentStatus,
} from "#server/utils/handlers/content.ts";
import { useQueue } from "#server/utils/queue.ts";
import { validateQueryZod, validateRouterZod } from "#server/utils/utils.ts";
import { defineHandler, defineRouteMeta } from "nitro";
import z from "zod";

const pathSchema = z.object({
	id: z.string().trim().pipe(z.uuid()),
});
const querySchema = z.object({
	status: z.enum(["published", "draft"]),
});
export default defineHandler(async (event) => {
	const query = await validateQueryZod(event, querySchema);
	const path = await validateRouterZod(event, pathSchema);

	const db = useDatabase();
	const exists = await contentExistsById(db, path.id);
	if (!exists) throw new ContentNotFoundError(path.id);

	await db.transaction((tx) => setContentStatus(tx, path.id, query.status));
	const queue = useQueue("content");
	queue.add(`content:status-change:${query.status}`, { contentId: path.id });
	event.res.status = 202;
});

defineRouteMeta({
	openAPI: {
		tags: ["Content"],
		opeartionId: "setContentStatus",
		summary: "Update content status",
		description: "Update the status of a content post",
		parameters: [
			{
				name: "id",
				schema: { type: "string", format: "uuid" },
				in: "path",
				required: true,
				description: "The content's ID",
			},
			{
				name: "status",
				schema: { type: "string", enum: ["published", "draft"] },
				in: "query",
				required: true,
				description: "The status value to set",
			},
		],
		responses: {
			404: { $ref: "#/components/responses/ResourceNotFoundException" },
			400: { $ref: "#/components/responses/BadRequestException" },
			202: { description: "The status was updated successfully" },
		},
	},
});
