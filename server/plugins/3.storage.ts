import { initStorage } from "#server/utils/storage.ts";
import { definePlugin } from "nitro";

export default definePlugin(async () => {
	await initStorage();
});
