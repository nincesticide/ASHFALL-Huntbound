import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const multiplayerEvents = sqliteTable(
  "multiplayer_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roomCode: text("room_code").notNull(),
    senderPeerId: text("sender_peer_id").notNull(),
    payload: text("payload").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("multiplayer_events_room_id_idx").on(table.roomCode, table.id),
    index("multiplayer_events_created_idx").on(table.createdAt),
  ],
);
