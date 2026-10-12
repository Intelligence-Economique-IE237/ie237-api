import { defineMiddleware } from "nitro";
import { getRequestFingerprint, getRequestIP } from "nitro/h3";

export default defineMiddleware(async (event) => {
	// console.log(event.res);
	// console.log(event);
	console.log(getRequestIP(event, { xForwardedFor: true }));
	console.log(event.req.headers)
});
