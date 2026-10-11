ALTER TABLE "content_attachment_groups" ADD COLUMN "id" text;--> statement-breakpoint
ALTER TABLE "content_attachment_groups" ADD PRIMARY KEY ("content","id");--> statement-breakpoint
CREATE INDEX "content_attachment_groups_id_index" ON "content_attachment_groups" ("id");