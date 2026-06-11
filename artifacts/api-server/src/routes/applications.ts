import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, applicationsTable, jobsTable, usersTable, companiesTable } from "@workspace/db";
import {
  ListApplicationsQueryParams,
  CreateApplicationBody,
  GetApplicationParams,
  UpdateApplicationStatusParams,
  UpdateApplicationStatusBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function formatApplication(app: any) {
  let job = null;
  let candidate = null;

  if (app.jobId) {
    const [j] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
    if (j) {
      let company = null;
      if (j.companyId) {
        const [c] = await db.select().from(companiesTable).where(eq(companiesTable.id, j.companyId));
        company = c ?? null;
      }
      job = { ...j, company, skills: j.skills ?? [] };
    }
  }

  if (app.candidateId) {
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, app.candidateId));
    if (u) {
      candidate = { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt };
    }
  }

  return { ...app, job, candidate };
}

router.get("/applications", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = ListApplicationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const conditions: any[] = [];

  // If job seeker, only see own applications
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (user?.role === "job_seeker") {
    conditions.push(eq(applicationsTable.candidateId, userId));
  } else if (parsed.data.candidateId) {
    conditions.push(eq(applicationsTable.candidateId, parsed.data.candidateId));
  }

  if (parsed.data.jobId) {
    conditions.push(eq(applicationsTable.jobId, parsed.data.jobId));
  }

  if (parsed.data.status) {
    conditions.push(eq(applicationsTable.status, parsed.data.status as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const apps = await db.select().from(applicationsTable)
    .where(whereClause)
    .orderBy(applicationsTable.appliedAt);

  const formatted = await Promise.all(apps.map(formatApplication));
  res.json(formatted);
});

router.post("/applications", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Check for duplicate
  const existing = await db.select().from(applicationsTable)
    .where(and(eq(applicationsTable.jobId, parsed.data.jobId), eq(applicationsTable.candidateId, userId)));
  if (existing.length > 0) {
    res.status(400).json({ error: "You have already applied to this job" });
    return;
  }

  const [app] = await db.insert(applicationsTable).values({
    jobId: parsed.data.jobId,
    candidateId: userId,
    status: "applied",
  }).returning();

  res.status(201).json(await formatApplication(app));
});

router.get("/applications/:id", async (req, res): Promise<void> => {
  const params = GetApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, params.data.id));
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(await formatApplication(app));
});

router.patch("/applications/:id/status", async (req, res): Promise<void> => {
  const params = UpdateApplicationStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateApplicationStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [app] = await db.update(applicationsTable)
    .set({ status: parsed.data.status as any })
    .where(eq(applicationsTable.id, params.data.id))
    .returning();

  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(await formatApplication(app));
});

export default router;
