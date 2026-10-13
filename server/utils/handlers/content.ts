import {
	content,
	contentAttachments,
	type Content,
} from "#server/database/schema.ts";
import {
	aliasedTable,
	and,
	count,
	eq,
	getColumns,
	isNull,
	not,
	sql,
	type SQLWrapper,
} from "drizzle-orm";
import { useDatabase, type ConnectionLike } from "../db";
import {
	ContentAlreadyExistsError,
	ContentAttachmentNotFoundError,
	ContentNotFoundError,
} from "../errors";
import { defineHandler, HTTPError } from "nitro";
import { getRouterParam } from "nitro/h3";
import z from "zod";

export async function deleteContent(tx: ConnectionLike, id: string) {
	await tx.delete(content).where(eq(content.id, id));
}

export async function toggleContentArchivedStatus(
	tx: ConnectionLike,
	id: string,
) {
	await tx
		.update(content)
		.set({
			isArchived: not(content.isArchived),
		})
		.where(and(eq(content.id, id), isNull(content.isTranslationOf)));
}

export function requireExistingContent(paramKey: string) {
	return defineHandler(async (event) => {
		const param = getRouterParam(event, paramKey);
		const { success, error, data } = z
			.string()
			.trim()
			.pipe(z.uuid())
			.safeParse(param);

		if (!success) {
			throw new HTTPError(z.prettifyError(error), { status: 400 });
		}

		const db = useDatabase();
		const exists = await contentExistsById(db, data);
		if (!exists) throw new ContentNotFoundError(data);

		event.context["contentId"] = param;
	});
}

export async function updateContent(
	tx: ConnectionLike,
	id: string,
	data: object,
) {
	await tx
		.update(content)
		.set({ ...data })
		.where(eq(content.id, id));
}

export async function setContentStatus(
	tx: ConnectionLike,
	contentId: string,
	status: Content["status"],
) {
	await tx
		.update(content)
		.set({
			status,
		})
		.where(eq(content.id, contentId));
}

export async function removeContentAttachment(
	tx: ConnectionLike,
	contentId: string,
	id: string,
) {
	const filters = [
		eq(contentAttachments.content, contentId),
		eq(contentAttachments.id, id),
	];
	const [attachment] = await tx
		.select()
		.from(contentAttachments)
		.where(and(...filters))
		.limit(1);

	if (!attachment) throw new ContentAttachmentNotFoundError(id, contentId);

	await tx.delete(contentAttachments).where(and(...filters));
	await tx
		.update(content)
		.set({
			updatedAt: new Date(),
		})
		.where(and(...filters));
	return attachment;
}
export async function getContentAttachmentById(
	tx: ConnectionLike,
	contentId: string,
	slug: string,
) {
	return tx.query.contentAttachments.findFirst({
		where: {
			content: contentId,
			id: slug,
		},
	});
}

export async function contentAttachmentExistsBySlug(
	tx: ConnectionLike,
	contentId: string,
	slug: string,
) {
	const result = await tx.execute<{ exists: boolean }>(
		sql`select exists(select 1 from ${contentAttachments} where ${contentAttachments.id} = ${slug} and ${contentAttachments.content} = ${contentId})`,
	);
	const { exists } = result.rows[0];
	return exists;
}

export type AddContentAttachmentParams = {
	content: string;
	slug: string;
	urls: string[];
	name: string;
};
export async function addContentAttachment(
	tx: ConnectionLike,
	{ content: contentId, urls, name, slug }: AddContentAttachmentParams,
) {
	await tx.insert(contentAttachments).values({
		content: contentId,
		urls,
		id: slug,
		name,
	});

	await tx
		.update(content)
		.set({
			updatedAt: new Date(),
		})
		.where(eq(content.id, contentId));
}

export async function contentExistsById(tx: ConnectionLike, id: string) {
	return await contentExistsByProp(tx, content.id, id);
}

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
			status: "published",
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
				not(content.isArchived),
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
				{ isArchived: false },
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
				{ isArchived: false },
			],
		},
	});
}

export async function getPublishedContentAttachments(
	tx: ConnectionLike,
	contentId: string,
) {
	return tx
		.select(getColumns(contentAttachments))
		.from(contentAttachments)
		.innerJoin(content, () => eq(contentAttachments.content, content.id))
		.where(
			and(
				eq(content.status, "published"),
				eq(contentAttachments.content, contentId),
				not(content.isArchived),
			),
		);
}
