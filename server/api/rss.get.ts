import { defineHandler } from "nitro"
import { defineRouteMeta } from "nitro"

// RSS feed items structure (JavaScript object)
const rssItems = [
	{
		id: "item-1",
		title: "Sample Article 1",
		description: "This is a sample RSS item description",
	 link: "https://ie237-api.example.com/articles/1",
		pubDate: new Date(),
	},
	{
		id: "item-2",
		title: "Sample Article 2",
		description: "This is another sample RSS item description",
	 link: "https://ie237-api.example.com/articles/2",
		pubDate: new Date(),
	},
]

// Transform JavaScript object to RSS 2.0 XML string
function objectToRssXml(items) {
	const pubDateToString = (date) => date.toUTCString()

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>IE237 API RSS Feed</title>
    <description>RSS feed for IE237 API articles and updates</description>
    <link>https://ie237-api.example.com/rss</link>
    ${items
		.map(
			(item) => `
    <item>
      <id>${item.id}</id>
      <title>${item.title}</title>
      <description>${item.description}</description>
      <link>${item.link}</link>
      <pubDate>${pubDateToString(item.pubDate)}</pubDate>
    </item>`
		)
		.join("")}
  </channel>
</rss>`
}

// GET /api/rss - Return RSS feed XML (transformed from JavaScript objects)
export default defineHandler((event) => {
	// Set content type to XML
	event.res.headers.set("content-type", "application/xml; charset=utf-8")

	// Transform JavaScript objects to RSS XML
	const xmlBody = objectToRssXml(rssItems)

	return {
		status: 200,
		body: xmlBody,
	}
})

// Define OpenAPI metadata for this route
defineRouteMeta({
	openAPI: {
		method: "GET",
		tags: ["RSS"],
		summary: "Get RSS feed XML",
		description: "Retrieve RSS feed XML for the IE237 API, transformed from JavaScript objects",
		responses: {
			200: {
			description: "RSS feed XML retrieved successfully",
				content: {
					"application/xml": {
						schema: {
							type: "string",
						},
					},
				},
			},
		},
	},
})