import { defineHandler } from "nitro"
import { defineRouteMeta } from "nitro"

// GET /api/rss - Return RSS feed XML
export default defineHandler((event) => {
	// Set content type to XML
	event.res.headers.set("content-type", "application/xml; charset=utf-8")

	// Mock RSS feed XML - will be replaced with real implementation
	// that fetches from a database or RSS source
	const mockRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>IE237 API RSS Feed</title>
    <description>RSS feed for IE237 API articles and updates</description>
    <link>https://ie237-api.example.com/rss</link>
    <item>
      <id>item-1</id>
      <title>Sample Article 1</title>
      <description>This is a sample RSS item description</description>
      <link>https://ie237-api.example.com/articles/1</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
    <item>
      <id>item-2</id>
      <title>Sample Article 2</title>
      <description>This is another sample RSS item description</description>
      <link>https://ie237-api.example.com/articles/2</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`

	return {
		status: 200,
		body: mockRssXml,
	}
})

// Define OpenAPI metadata for this route
defineRouteMeta({
	openAPI: {
		method: "GET",
		tags: ["RSS"],
		summary: "Get RSS feed XML",
		description: "Retrieve RSS feed XML for the IE237 API",
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