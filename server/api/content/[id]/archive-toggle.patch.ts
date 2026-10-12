import { useDatabase } from "#server/utils/db.ts";
import {
	requireExistingContent,
	toggleContentArchivedStatus,
} from "#server/utils/handlers/content.ts";
import { useQueue } from "#server/utils/queue.ts";
import { defineHandler, defineRouteMeta } from "nitro";

export default defineHandler({
	middleware: [requireExistingContent("id")],
	handler: async (event) => {
		const { contentId } = event.context;
		const db = useDatabase();
		await db.transaction((tx) =>
			toggleContentArchivedStatus(tx, contentId as string),
		);
		event.res.status = 202;
		const queue = useQueue("content");
		await queue.add("archived.update", { contentId });
	},
});

defineRouteMeta({
	openAPI: {
		description: "Toggle archived status of a content post",
		summary: "Toggle archived",
		tags: ["Content"],
		operationId: "toggleContentArchivedStatus",
		parameters: [
			{
				required: true,
				name: "id",
				schema: { type: "string", format: "uuid" },
				description: "The content's ID",
				in: "path",
			},
		],
		responses: {
			202: {
				description:
					"The content's archived status was toggled successfully",
			},
			400: { $ref: "#/components/responses/BadRequestException" },
			404: { $ref: "#/components/responses/ResourceNotFoundException" },
		},
	},
});
