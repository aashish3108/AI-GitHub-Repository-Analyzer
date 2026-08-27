import { pgTable, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

export const analyses = pgTable("analyses", {
  id: text("id").primaryKey(),
  repositoryUrl: text("repository_url").notNull(),
  owner: text("owner").notNull(),
  repo: text("repo").notNull(),
  status: text("status").notNull().default("pending"), // pending, analyzing, completed, failed
  progress: integer("progress").notNull().default(0),
  progressMessage: text("progress_message"),
  result: jsonb("result"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
