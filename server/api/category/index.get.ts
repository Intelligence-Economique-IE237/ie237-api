import { useDatabase } from "#server/utils/db.ts"
import { defineHandler } from "nitro"

// GET /api/category - List all categories
export default defineHandler(async (event) => {
	const db = useDatabase()

	// TODO: Fetch categories from database using drizzle ORM
	// const { data } = await db.select().from(categories)

	// Mock response for foundation phase
	const mockCategories = [
		{
			id: "cat-1",
			name: "News",
			description: "News categories",
			slug: "news",
		},
		{
			id: "cat-2",
			name: "Blog",
			description: "Blog categories",
			slug: "blog",
		},
	]

	return {
		success: true,
		data: mockCategories,
	}
})