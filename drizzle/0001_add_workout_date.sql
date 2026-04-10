ALTER TABLE "workouts" ADD COLUMN "date" date;--> statement-breakpoint
UPDATE "workouts" SET "date" = ("started_at" AT TIME ZONE 'America/Los_Angeles')::date;--> statement-breakpoint
ALTER TABLE "workouts" ALTER COLUMN "date" SET NOT NULL;--> statement-breakpoint
DROP INDEX "workouts_user_date_idx";--> statement-breakpoint
CREATE INDEX "workouts_user_date_idx" ON "workouts" USING btree ("user_id","date");
