import { initDb } from "#server/utils/db.ts";
import { definePlugin } from "nitro";

export default definePlugin(app => {
	initDb()
})