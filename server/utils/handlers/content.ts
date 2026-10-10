import { content, type Content } from "#server/database/schema.ts";
import { aliasedTable, and, count, eq, exists, isNull, sql } from "drizzle-orm";
import type { ConnectionLike } from "../db";
import { ContentAlreadyExistsError } from "../errors";

export type CreateContentOptions = {
	title: string;
	slug: string;
	language: string;
	type: Content["type"];
};
export async function createContent(
	tx: ConnectionLike,
	options: CreateContentOptions,
) {
	const result = await tx.execute<{ exists: boolean }>(sql`
select exists(
	select 
		1 
	from 
		${content}
	where
		${eq(content.slug, options.slug)}
)
`);

	if (result.rows[0].exists) {
		throw new ContentAlreadyExistsError(options.slug);
	}
	const [{ id }] = await tx
		.insert(content)
		.values({
			language: options.language,
			slug: options.slug,
			title: options.title,
			type: options.type,
		})
		.returning({ id: content.id });
	return id;
}

export async function getPublishedContentStats(tx: ConnectionLike) {
	const [{ total }] = await tx
		.select({ total: count() })
		.from(content)
		.where(
			and(
				eq(content.status, "published"),
				isNull(content.isTranslationOf),
			),
		);
	return {
		totalRecords: total,
	};
}

export async function findPublishedContent(
	tx: ConnectionLike,
	page: number,
	size: number,
	query?: string,
) {
	const c = aliasedTable(content, "c");
	const filters = [eq(c.status, "published"), isNull(c.isTranslationOf)];

	if (query) {
		filters.push(
			sql`to_tsvector('simple', coalesce(${c.title}, '') || ' ' || coalesce(${c.excerpt}, '')) @@ websearch_to_tsquery('simple', ${query})`,
		);
	}

	return await tx.query.content.findMany({
		columns: { content: false },
		with: {
			attachmentGroups: { columns: { urls: true } },
		},
		where: {
			AND: [
				{ status: "published" },
				{ isTranslationOf: { isNull: true } },
			],
		},
		offset: page * size,
		limit: size,
		orderBy: {
			updatedAt: "desc",
		},
	});
}

export async function findPublishedContentBySlug(
	tx: ConnectionLike,
	slug: string,
) {
	return await tx.query.content.findFirst({
		columns: { content: false },
		where: {
			slug,
		},
	});
}
