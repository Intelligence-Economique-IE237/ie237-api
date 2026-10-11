import { useDatabase } from "#server/utils/db.ts";
import { removeContentAttachment } from "#server/utils/handlers/content.ts";
import { useQueue } from "#server/utils/queue.ts";
import { validateRouterZod } from "#server/utils/utils.ts";
import { defineHandler, defineRouteMeta } from "nitro";
import z from "zod";

const pathSchema = z.object({
	id: z.string().trim().nonempty().pipe(z.uuid()),
	attachment: z.string().trim().nonempty(),
});
export default defineHandler(async (event) => {
	const path = await validateRouterZod(event, pathSchema);

	const db = useDatabase();
	const attachment = await db.transaction((tx) =>
		removeContentAttachment(tx, path.id, path.attachment),
	);

	const queue = useQueue("storage");
	for (const url of attachment.urls) {
		queue.add("remove-attachment", {
			url,
			contentId: path.id,
			attachmentId: path.attachment,
		});
	}
	event.res.status = 202;
});

defineRouteMeta({
	openAPI: {
		summary: "Remove Attachment",
		description: "Remove content attachment by id",
		tags: ["Content", "Attachments"],
		operationId: "removeAttachmentById",
		responses: {
			400: { $ref: "#/components/resposnes/BadRequestException" },
			404: {
				$ref: "#/components/response/ResourceNotFoundException",
			},
			202: { description: "The attachment was removed successfully" },
		},
		parameters: [
			{
				name: "id",
				in: "path",
				required: true,
				schema: { type: "string", format: "uuid" },
				description: "The content's ID",
			},
			{
				name: "attachment",
				in: "path",
				required: true,
				schema: { type: "string" },
				description: "The attachment's ID",
			},
		],
	},
});
