CREATE UNIQUE INDEX "friendships_pair_idx" ON "friendships" USING btree ("requester_character_id","addressee_character_id");--> statement-breakpoint
CREATE INDEX "refresh_tokens_hash_idx" ON "refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_idx" ON "refresh_tokens" USING btree ("user_id");