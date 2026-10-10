import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	categories: {
		content: r.many.content()
	},
	content: {
		contentCategory: r.one.categories({
			from: r.content.category,
			to: r.categories.slug
		}),
		parent: r.one.content({
			from: r.content.isTranslationOf,
			to: r.content.id,
		}),
		translations: r.many.content(),
		attachmentGroups: r.many.contentAttachments({
			from: r.content.id,
			to: r.contentAttachments.content,
		}),
	},
}));
