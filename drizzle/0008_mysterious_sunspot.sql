CREATE TABLE "agent_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"seq" bigserial NOT NULL,
	"thread_id" uuid NOT NULL,
	"event" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_threads" ADD COLUMN "pending_confirm" text;--> statement-breakpoint
ALTER TABLE "agent_events" ADD CONSTRAINT "agent_events_thread_id_agent_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."agent_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_events_thread_seq_idx" ON "agent_events" USING btree ("thread_id","seq");