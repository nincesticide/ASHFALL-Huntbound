import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const multiplayerRooms = sqliteTable(
  "multiplayer_rooms",
  {
    roomCode: text("room_code").primaryKey(),
    roomSessionId: text("room_session_id").notNull(),
    hostPeerId: text("host_peer_id").notNull(),
    hostUserId: text("host_user_id").notNull(),
    inviteTokenHash: text("invite_token_hash").notNull(),
    status: text("status").notNull().default("active"),
    protocolVersion: integer("protocol_version").notNull().default(2),
    authorityEpoch: integer("authority_epoch").notNull().default(1),
    leaseExpiresAt: integer("lease_expires_at").notNull(),
    snapshotJson: text("snapshot_json"),
    snapshotVersion: integer("snapshot_version").notNull().default(0),
    snapshotEventCursor: integer("snapshot_event_cursor").notNull().default(0),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    expiresAt: integer("expires_at").notNull(),
  },
  (table) => [
    uniqueIndex("multiplayer_rooms_session_idx").on(table.roomSessionId),
    index("multiplayer_rooms_expires_idx").on(table.expiresAt),
    index("multiplayer_rooms_lease_idx").on(table.leaseExpiresAt),
  ],
);

export const multiplayerMembers = sqliteTable(
  "multiplayer_members",
  {
    roomCode: text("room_code").notNull(),
    roomSessionId: text("room_session_id").notNull(),
    peerId: text("peer_id").notNull(),
    userId: text("user_id").notNull(),
    characterId: text("character_id").notNull(),
    tokenHash: text("token_hash").notNull(),
    joinedAt: integer("joined_at").notNull(),
    lastSeenAt: integer("last_seen_at").notNull(),
    lastClientSeq: integer("last_client_seq").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.roomSessionId, table.peerId] }),
    uniqueIndex("multiplayer_members_token_idx").on(table.roomSessionId, table.tokenHash),
    index("multiplayer_members_room_joined_idx").on(table.roomSessionId, table.joinedAt),
    index("multiplayer_members_code_idx").on(table.roomCode),
    index("multiplayer_members_seen_idx").on(table.lastSeenAt),
  ],
);

export const multiplayerEvents = sqliteTable(
  "multiplayer_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roomCode: text("room_code").notNull(),
    roomSessionId: text("room_session_id"),
    senderPeerId: text("sender_peer_id").notNull(),
    senderUserId: text("sender_user_id"),
    eventId: text("event_id"),
    protocolVersion: integer("protocol_version").notNull().default(1),
    authorityEpoch: integer("authority_epoch").notNull().default(0),
    clientSeq: integer("client_seq"),
    payload: text("payload").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("multiplayer_events_room_id_idx").on(table.roomCode, table.id),
    index("multiplayer_events_session_id_idx").on(table.roomSessionId, table.id),
    index("multiplayer_events_created_idx").on(table.createdAt),
    uniqueIndex("multiplayer_events_room_event_idx").on(table.roomSessionId, table.eventId),
    uniqueIndex("multiplayer_events_room_sender_seq_idx").on(
      table.roomSessionId,
      table.senderPeerId,
      table.clientSeq,
    ),
  ],
);
