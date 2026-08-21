CREATE TABLE `multiplayer_members` (
	`room_code` text NOT NULL,
	`room_session_id` text NOT NULL,
	`peer_id` text NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`joined_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL,
	`last_client_seq` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`room_session_id`, `peer_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `multiplayer_members_token_idx` ON `multiplayer_members` (`room_session_id`,`token_hash`);--> statement-breakpoint
CREATE INDEX `multiplayer_members_room_joined_idx` ON `multiplayer_members` (`room_session_id`,`joined_at`);--> statement-breakpoint
CREATE INDEX `multiplayer_members_code_idx` ON `multiplayer_members` (`room_code`);--> statement-breakpoint
CREATE INDEX `multiplayer_members_seen_idx` ON `multiplayer_members` (`last_seen_at`);--> statement-breakpoint
CREATE TABLE `multiplayer_rooms` (
	`room_code` text PRIMARY KEY NOT NULL,
	`room_session_id` text NOT NULL,
	`host_peer_id` text NOT NULL,
	`host_user_id` text NOT NULL,
	`invite_token_hash` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`protocol_version` integer DEFAULT 2 NOT NULL,
	`authority_epoch` integer DEFAULT 1 NOT NULL,
	`lease_expires_at` integer NOT NULL,
	`snapshot_json` text,
	`snapshot_version` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `multiplayer_rooms_session_idx` ON `multiplayer_rooms` (`room_session_id`);--> statement-breakpoint
CREATE INDEX `multiplayer_rooms_expires_idx` ON `multiplayer_rooms` (`expires_at`);--> statement-breakpoint
CREATE INDEX `multiplayer_rooms_lease_idx` ON `multiplayer_rooms` (`lease_expires_at`);--> statement-breakpoint
ALTER TABLE `multiplayer_events` ADD `room_session_id` text;--> statement-breakpoint
ALTER TABLE `multiplayer_events` ADD `sender_user_id` text;--> statement-breakpoint
ALTER TABLE `multiplayer_events` ADD `event_id` text;--> statement-breakpoint
ALTER TABLE `multiplayer_events` ADD `protocol_version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `multiplayer_events` ADD `authority_epoch` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `multiplayer_events` ADD `client_seq` integer;--> statement-breakpoint
CREATE INDEX `multiplayer_events_session_id_idx` ON `multiplayer_events` (`room_session_id`,`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `multiplayer_events_room_event_idx` ON `multiplayer_events` (`room_session_id`,`event_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `multiplayer_events_room_sender_seq_idx` ON `multiplayer_events` (`room_session_id`,`sender_peer_id`,`client_seq`);