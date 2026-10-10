import { defineRouteMeta } from "nitro";
import { defineHandler, getValidatedQuery } from "nitro/h3";
import { useRuntimeConfig } from "nitro/runtime-config";
import RSS from "rss";
import z from "zod";

const querySchema = z.object({
	category: z.string().nullish().default(null),
	page: z.coerce
		.number()
		.positive("Must be greater than zero")
		.nullish()
		.default(0),
	size: z.coerce
		.number()
		.positive("Must be greater than zero")
		.nullish()
		.default(100),
});

export default defineHandler(async (event) => {
	const { data: query } = await getValidatedQuery(
		event,
		querySchema.safeParse,
	);
	const { siteOrigin } = useRuntimeConfig();

	const feed = new RSS({
		title: "IE237 ",
		description: "",
		site_url: siteOrigin,
		feed_url: `${siteOrigin}/rss?category=${query?.category || ""}`,
		pubDate: new Date(),
		language: "en",
	});

	event.res.headers.set("Content-Type", "application/rss+xml");
	return feed.xml();
});

defineRouteMeta({
	openAPI: {
		tags: ["RSS"],
		description: "Returns paginated RSS feeds",
		summary: "RSS feed",
		parameters: [
			{
				in: "query",
				name: "category",
				description: "The category preferred for by the user's request",
			},
			{
				name: "page",
				in: "query",
				description: "The pagination page offset",
				schema: { type: "number", min: 0 },
			},
			{
				name: "size",
				in: "query",
				description: "The pagination page size",
				schema: { type: "number", min: 0 },
			},
		],
		responses: {
			200: {
				description: 'RSS feed',
				content: {
					'application/rss+xml': {
					}
				}
			}
		}
	},
});