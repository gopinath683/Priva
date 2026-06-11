import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, jobsTable } from "@workspace/db";
import { ListUsersQueryParams, DeleteUserParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admin/users", async (req, res): Promise<void> => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let query = db.select().from(usersTable);
  const users = parsed.data.role
    ? await db.select().from(usersTable).where(eq(usersTable.role, parsed.data.role as any))
    : await db.select().from(usersTable);

  res.json(users.map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt,
  })));
});

router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  const params = DeleteUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/admin/jobs", async (_req, res): Promise<void> => {
  const jobs = await db.select().from(jobsTable).orderBy(jobsTable.postedAt);
  res.json(jobs.map(j => ({ ...j, skills: j.skills ?? [], company: null })));
});

export default router;
