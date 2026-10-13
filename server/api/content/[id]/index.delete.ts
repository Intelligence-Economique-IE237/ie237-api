import { useDatabase } from "#server/utils/db.ts";
import {
	deleteContent,
	requireExistingContent,
} from "#server/utils/handlers/content.ts";
import { useQueue } from "#server/utils/queue.ts";
import { defineHandler, defineRouteMeta } from "nitro";

export default defineHandler({
	middleware: [requireExistingContent("id")],
	handler: async (event) => {
		const db = useDatabase();
		await db.transaction(async (tx) => {
			await deleteContent(tx, event.context.contentId as string);
			const queue = useQueue("content");
			await queue.add("delete", { contentId: event.context.contentId });
		});
		event.res.status = 202;
	},
});

defineRouteMeta({
	openAPI: {
		tags: ["Content"],
		summary: "Delete Content post",
		parameters: [
			{
				name: "id",
				schema: { type: "string", format: "uuid" },
				required: true,
				description: "The content's ID",
			},
		],
		responses: {
			202: { description: "The content was deleted successfully" },
			404: { $ref: "#/components/responses/ResourceNotFoundException" },
			400: { $ref: "#/components/responses/BadRequestException" },
		},
	},
});
