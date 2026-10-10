import { content, type Content } from "#server/database/schema.ts";
import {
	aliasedTable,
	and,
	count,
	eq,
	isNull,
	sql,
	type AnyColumn,
	type SQLWrapper,
} from "drizzle-orm";
import type { ConnectionLike } from "../db";
import { ContentAlreadyExistsError, ContentNotFoundError } from "../errors";

export type UpdateContentBodyOpts = {
	id: string;
	content: string;
};
export async function updateContentBody(
	tx: ConnectionLike,
	opts: UpdateContentBodyOpts,
) {
	const c = await tx.query.content.findFirst({
		where: {
			id: opts.id,
			isTranslationOf: {
				isNull: true,
			},
		},
	});

	if (!c) {
		throw new ContentNotFoundError(opts.id);
	}
	await tx
		.update(content)
		.set({
			content: opts.content,
		})
		.where(and(eq(content.id, opts.id), isNull(content.isTranslationOf)));
}

export async function getContentBody(tx: ConnectionLike, id: string) {
	const exists = await contentExistsByProp(tx, content.id, id);
	if (!exists) throw new ContentNotFoundError(id);

	return await tx.query.content.findFirst({
		columns: { content: true },
		where: {
			id,
		},
	});
}

async function contentExistsByProp(
	tx: ConnectionLike,
	col: SQLWrapper<unknown>,
	propValue: SQLWrapper<unknown> | unknown,
) {
	const result = await tx.execute<{ exists: boolean }>(sql`
select exists(
	select 
		1 
	from 
		${content}
	where
		${eq(col, propValue)}
)
`);

	return result.rows[0].exists;
}

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
	const exists = await contentExistsByProp(tx, content.slug, options.slug);
	if (exists) throw new ContentAlreadyExistsError(options.slug);

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

export async function lookupPublishedContent(
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
		columns: { content: false, tags: false },
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

export async function lookupPublishedContentById(
	tx: ConnectionLike,
	id: string,
) {
	return await tx.query.content.findFirst({
		columns: { content: false, tags: false },
		where: {
			AND: [
				{ id },
				{ status: "published" },
				{ isTranslationOf: { isNull: true } },
			],
		},
	});
}
