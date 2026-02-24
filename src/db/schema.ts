import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  decimal,
  pgEnum,
  primaryKey
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "finished"
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  postalCode: varchar("postal_code", { length: 20 }),
  street: varchar("street", { length: 255 }),
  number: varchar("number", { length: 20 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
});

export const usersToWorkspaces = pgTable("users_to_workspaces", {
  userId: uuid("user_id").references(() => users.id).notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.workspaceId] }), // Boa prática: PK composta
}));

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  pricePerHourInCents: integer("price_per_hour_in_cents").notNull(),
  capacity: integer("capacity").notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id").references(() => rooms.id).notNull(),
  createdByUserId: uuid("created_by_user_id").references(() => users.id).notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: bookingStatusEnum("status").default("pending").notNull(),
  totalPriceInCents: integer("total_price_in_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const usersRelations = relations(users, ({ many }) => ({
  bookingsCreated: many(bookings),
  usersToWorkspaces: many(usersToWorkspaces),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  rooms: many(rooms),
  usersToWorkspaces: many(usersToWorkspaces),
}));

export const usersToWorkspacesRelations = relations(usersToWorkspaces, ({ one }) => ({
  user: one(users, {
    fields: [usersToWorkspaces.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [usersToWorkspaces.workspaceId],
    references: [workspaces.id],
  }),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [rooms.workspaceId], references: [workspaces.id] }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  room: one(rooms, { fields: [bookings.roomId], references: [rooms.id] }),
  creator: one(users, { fields: [bookings.createdByUserId], references: [users.id] }),
  customer: one(customers, { fields: [bookings.customerId], references: [customers.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  bookings: many(bookings),
}));