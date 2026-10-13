import {
	categories,
	type Category,
} from "#server/database/schema.ts";
import { eq } from "drizzle-orm";
import { useDatabase, type ConnectionLike } from "../db";
import { ContentNotFoundError } from "../errors";

export async function getCategories(
	tx: ConnectionLike,
	page: number = 0,
	size: number = 10,
) {
	const totalRecords = await tx.$executeRaw`select count(*) from ${categories}`

	const allCategories = await tx.query.categories.findMany({
		orderBy: (fields, { asc }) => asc(fields.title),
		limit: size,
		offset: page * size,
	})

	return {
		data: allCategories,
		totalRecords,
	}
}

export async function getCategoryById(
	tx: ConnectionLike,
	slug: string,
) {
	const category = await tx.query.categories.findFirst({
		where: eq(categories.slug, slug),
	})

	if (!category) {
		throw new ContentNotFoundError(slug, "category")
	}

	return category
}

export async function createCategory(
	tx: ConnectionLike,
	data: {
		title: string
		description?: string
		slug: string
	},
) {
	// Check if category with this slug already exists
	const existing = await tx.query.categories.findFirst({
		where: eq(categories.slug, data.slug),
	})

	if (existing) {
		throw new Error(`Category with slug "${data.slug}" already exists`)
	}

	const newCategory = await tx
		.insert(categories)
		.values({
			title: data.title,
			description: data.description,
			slug: data.slug,
		})
		.returning()

	return newCategory[0]
}

export async function updateCategory(
	tx: ConnectionLike,
	slug: string,
	data: {
		title?: string
		description?: string
	},
) {
	// Check if category exists
	const existing = await tx.query.categories.findFirst({
		where: eq(categories.slug, slug),
	})

	if (!existing) {
		throw new ContentNotFoundError(slug, "category")
	}

	const updatedCategory = await tx
		.update(categories)
		.set({
			title: data.title ?? existing.title,
			description: data.description ?? existing.description,
		})
		.where(eq(categories.slug, slug))
		.returning()

	return updatedCategory[0]
}

export async function deleteCategory(
	tx: ConnectionLike,
	slug: string,
) {
	// Check if category exists
	const existing = await tx.query.categories.findFirst({
		where: eq(categories.slug, slug),
	})

	if (!existing) {
		throw new ContentNotFoundError(slug, "category")
	}

	await tx.delete(categories).where(eq(categories.slug, slug))
	return { success: true, message: "Category deleted successfully" }
}