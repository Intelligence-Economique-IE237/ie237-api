CREATE INDEX "content_updated_at_index" ON "content" ("updated_at");--> statement-breakpoint
CREATE INDEX "content_created_at_index" ON "content" ("created_at");--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_is_translation_of_content_id_fkey" FOREIGN KEY ("is_translation_of") REFERENCES "content"("id");--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_category_categories_slug_fkey" FOREIGN KEY ("category") REFERENCES "categories"("slug") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "content_attachment_groups" ADD CONSTRAINT "content_attachment_groups_content_content_id_fkey" FOREIGN KEY ("content") REFERENCES "content"("id") ON DELETE CASCADE;