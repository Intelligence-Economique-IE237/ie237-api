import { defineHandler } from "nitro";

export default defineHandler(async (event) => {
	event.res.headers.set("content-type", "application/xml");
});
