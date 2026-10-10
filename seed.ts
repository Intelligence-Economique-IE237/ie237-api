import { categories, content } from "#server/database/schema.ts";
import { faker } from "@faker-js/faker";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(String(process.env.NITRO_DB_URL));
const seed = "lkjdlfjeio08939";

const catCount = 20;
const catSlugs = Array<string>();

await db.transaction(async () => {
	for (let i = 0; i < catCount; i++) {
		const slug = faker.lorem.slug({ min: 1, max: 4 });
		await db
			.insert(categories)
			.values({
				slug,
				title: [
					faker.word.adjective({ length: { min: 5, max: 10 } }),
					faker.word.noun(),
				].join(" "),
			})
			.onConflictDoNothing();
		catSlugs.push(slug);
	}

	for (const slug of catSlugs) {
		const maxContents = faker.number.int({ min: 1, max: 15 });
		for (let i = 0; i < maxContents; i++) {
			const c = faker.lorem.paragraphs({ min: 1, max: 8 });
			await db
				.insert(content)
				.values({
					content: c,
					language: faker.location.language().alpha2,
					slug: faker.lorem.slug({ min: 1, max: 4 }),
					title: faker.lorem.text(),
					type: faker.helpers.arrayElement(["blog", "news"]),
					category: slug,
					excerpt: c.substring(0, 50),
					status: faker.helpers.arrayElement(["draft", "published"]),
				})
				.onConflictDoNothing();
		}
	}
});
