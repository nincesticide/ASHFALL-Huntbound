CREATE TABLE `multiplayer_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_code` text NOT NULL,
	`sender_peer_id` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `multiplayer_events_room_id_idx` ON `multiplayer_events` (`room_code`,`id`);--> statement-breakpoint
CREATE INDEX `multiplayer_events_created_idx` ON `multiplayer_events` (`created_at`);