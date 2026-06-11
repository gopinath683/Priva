import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";
import { usersTable } from "./users";

export const workModeEnum = pgEnum("work_mode", ["remote", "hybrid", "onsite"]);
export const employmentTypeEnum = pgEnum("employment_type", ["full-time", "part-time"]);
export const jobStatusEnum = pgEnum("job_status", ["active", "inactive", "pending"]);

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companiesTable.id, { onDelete: "set null" }),
  recruiterId: integer("recruiter_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  skills: text("skills").array().notNull().default([]),
  location: text("location").notNull(),
  experienceMin: integer("experience_min"),
  experienceMax: integer("experience_max"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  workMode: workModeEnum("work_mode").notNull().default("onsite"),
  employmentType: employmentTypeEnum("employment_type").notNull().default("full-time"),
  status: jobStatusEnum("status").notNull().default("pending"),
  postedAt: timestamp("posted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, postedAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
