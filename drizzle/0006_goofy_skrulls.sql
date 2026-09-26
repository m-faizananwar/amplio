CREATE TABLE "brand_logos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"brand_id" uuid NOT NULL,
	"data_url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brand_logos" ADD CONSTRAINT "brand_logos_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "brand_logos_brand_id_idx" ON "brand_logos" USING btree ("brand_id");