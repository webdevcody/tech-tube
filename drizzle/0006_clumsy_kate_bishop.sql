CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"subscriber_id" text NOT NULL,
	"subscribed_to_id" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_subscriber_id_user_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_subscribed_to_id_user_id_fk" FOREIGN KEY ("subscribed_to_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;