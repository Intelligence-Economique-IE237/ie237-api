import { useDatabase } from "#server/utils/db.ts";
import { ResourceNotFoundError } from "#server/utils/errors.ts";
import {
	categoryExistsById,
	deleteCategory,
} from "#server/utils/handlers/category.ts";
import { validateRouterZod } from "#server/utils/utils.ts";
import { defineHandler, defineRouteMeta } from "nitro";
import z from "zod";

const pathSchema = z.object({
	id: z.string().trim().nonempty(),
});
export default defineHandler(async (event) => {
	const path = await validateRouterZod(event, pathSchema);
	const db = useDatabase();

	if (await categoryExistsById(db, path.id)) {
		await db.transaction((tx) => deleteCategory(tx, path.id));
	} else throw new ResourceNotFoundError(`Category: ${path.id}`);

	event.res.status = 202;
});

defineRouteMeta({
	openAPI: {
		summary: "Delete Category",
		description:
			"Delete a category. This will not remove any content under it",
		parameters: [
			{
				name: "id",
				in: "path",
				required: true,
				schema: { type: "string" },
			},
		],
		responses: {
			202: { description: "The category was deleted successfully" },
			404: { $ref: "#/components/responses/ResourceNotFoundException" },
			400: { $ref: "#/components/responses/BadRequestException" },
		},
		operationId: "deleteContentCategoryById",
		tags: ["Category"],
	},
});
