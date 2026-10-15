import { categories } from "#server/database/schema.ts";
import { eq, sql } from "drizzle-orm";
import { type ConnectionLike } from "../db";
import { ResourceConflictError, ResourceNotFoundError } from "../errors";

export async function getCategories(
	tx: ConnectionLike,
	page: number = 0,
	size: number = 10,
) {
	const totalRecords = await tx.execute<{ count: number }>(
		sql`select count(*) from ${categories}`,
	);

	const allCategories = await tx.query.categories.findMany({
		orderBy: (fields, { desc }) => desc(fields.updatedAt),
		limit: size,
		offset: page * size,
	});

	return {
		data: allCategories,
		totalRecords: totalRecords.rows[0].count,
	};
}

export async function getCategoryById(tx: ConnectionLike, slug: string) {
	const category = await tx.query.categories.findFirst({
		where: { slug },
	});

	if (!category) {
		throw new ResourceNotFoundError(`Category not found: ${slug}`);
	}

	return category;
}

export async function createCategory(
	tx: ConnectionLike,
	data: {
		title: string;
		description?: string;
		slug: string;
	},
) {
	// Check if category with this slug already exists
	const existing = await tx.query.categories.findFirst({
		where: { slug: data.slug },
	});

	if (existing) {
		throw new ResourceConflictError(
			`Category already exists: ${data.slug}`,
		);
	}

	const newCategory = await tx
		.insert(categories)
		.values({
			title: data.title,
			description: data.description,
			slug: data.slug,
		})
		.returning();

	return newCategory[0];
}

export async function updateCategory(
	tx: ConnectionLike,
	slug: string,
	data: {
		title?: string;
		tags?: string[];
		description?: string;
		newSlug?: string;
	},
) {
	// Check if category exists
	const existing = await tx.query.categories.findFirst({
		where: { slug },
	});

	if (!existing) {
		throw new ResourceNotFoundError(`Category not found: ${slug}`);
	}

	const [updatedCategory] = await tx
		.update(categories)
		.set({
			slug: data.newSlug ?? slug,
			title: data.title ?? existing.title,
			description: data.description ?? existing.description,
			tags: data.tags ?? existing.tags,
		})
		.where(eq(categories.slug, slug))
		.returning();
	return updatedCategory;
}

export async function deleteCategory(tx: ConnectionLike, slug: string) {
	await tx.delete(categories).where(eq(categories.slug, slug));
	return { success: true, message: "Category deleted successfully" };
}

export async function categoryExistsById(tx: ConnectionLike, slug: string) {
	const result = await tx.execute<{ exists: boolean }>(
		sql`select exists(select 1 from ${categories} where ${eq(categories.slug, slug)})`,
	);

	return result.rows[0].exists;
}
