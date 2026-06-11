import { Router, type IRouter } from "express";
import { eq, and, or, ilike, sql, gte, lte } from "drizzle-orm";
import { db, jobsTable, companiesTable } from "@workspace/db";
import {
  ListJobsQueryParams,
  CreateJobBody,
  GetJobParams,
  UpdateJobParams,
  UpdateJobBody,
  DeleteJobParams,
  UpdateJobStatusParams,
  UpdateJobStatusBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function formatJob(job: any) {
  let company = null;
  if (job.companyId) {
    const [c] = await db.select().from(companiesTable).where(eq(companiesTable.id, job.companyId));
    company = c ?? null;
  }
  return { ...job, company, skills: job.skills ?? [] };
}

router.get("/jobs/featured", async (_req, res): Promise<void> => {
  const jobs = await db.select().from(jobsTable)
    .where(eq(jobsTable.status, "active"))
    .orderBy(jobsTable.postedAt)
    .limit(8);
  const formatted = await Promise.all(jobs.map(formatJob));
  res.json(formatted);
});

router.get("/jobs/categories", async (_req, res): Promise<void> => {
  const remoteCnt = await db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(and(eq(jobsTable.status, "active"), eq(jobsTable.workMode, "remote")));
  const hybridCnt = await db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(and(eq(jobsTable.status, "active"), eq(jobsTable.workMode, "hybrid")));
  const onsiteCnt = await db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(and(eq(jobsTable.status, "active"), eq(jobsTable.workMode, "onsite")));
  const fullTimeCnt = await db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(and(eq(jobsTable.status, "active"), eq(jobsTable.employmentType, "full-time")));
  const partTimeCnt = await db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(and(eq(jobsTable.status, "active"), eq(jobsTable.employmentType, "part-time")));

  res.json([
    { label: "Remote", count: remoteCnt[0]?.count ?? 0 },
    { label: "Hybrid", count: hybridCnt[0]?.count ?? 0 },
    { label: "On-site", count: onsiteCnt[0]?.count ?? 0 },
    { label: "Full-time", count: fullTimeCnt[0]?.count ?? 0 },
    { label: "Part-time", count: partTimeCnt[0]?.count ?? 0 },
  ]);
});

router.get("/jobs", async (req, res): Promise<void> => {
  const parsed = ListJobsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { keyword, location, workMode, employmentType, experienceLevel, status, companyId, limit = 20, offset = 0 } = parsed.data;

  const conditions: any[] = [];

  if (status) {
    conditions.push(eq(jobsTable.status, status as any));
  } else {
    conditions.push(eq(jobsTable.status, "active"));
  }

  if (keyword) {
    conditions.push(or(
      ilike(jobsTable.title, `%${keyword}%`),
      ilike(jobsTable.description, `%${keyword}%`)
    ));
  }

  if (location) {
    conditions.push(ilike(jobsTable.location, `%${location}%`));
  }

  if (workMode) {
    conditions.push(eq(jobsTable.workMode, workMode as any));
  }

  if (employmentType) {
    conditions.push(eq(jobsTable.employmentType, employmentType as any));
  }

  if (companyId) {
    conditions.push(eq(jobsTable.companyId, companyId));
  }

  if (experienceLevel) {
    if (experienceLevel === "fresher") {
      conditions.push(or(
        eq(jobsTable.experienceMin, 0),
        sql`${jobsTable.experienceMin} IS NULL`
      ));
      conditions.push(or(
        lte(jobsTable.experienceMax, 1),
        sql`${jobsTable.experienceMax} IS NULL`
      ));
    } else if (experienceLevel === "1-3") {
      conditions.push(gte(jobsTable.experienceMin, 1));
      conditions.push(lte(jobsTable.experienceMax, 3));
    } else if (experienceLevel === "3-5") {
      conditions.push(gte(jobsTable.experienceMin, 3));
      conditions.push(lte(jobsTable.experienceMax, 5));
    } else if (experienceLevel === "5+") {
      conditions.push(gte(jobsTable.experienceMin, 5));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const jobs = await db.select().from(jobsTable)
    .where(whereClause)
    .orderBy(jobsTable.postedAt)
    .limit(limit ?? 20)
    .offset(offset ?? 0);

  const totalResult = await db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(whereClause);
  const total = totalResult[0]?.count ?? 0;

  const formatted = await Promise.all(jobs.map(formatJob));
  res.json({ jobs: formatted, total });
});

router.post("/jobs", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db.insert(jobsTable).values({
    ...parsed.data,
    skills: parsed.data.skills ?? [],
    recruiterId: userId,
    status: "active",
  }).returning();

  res.status(201).json(await formatJob(job));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(await formatJob(job));
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: any = { ...parsed.data };
  if (parsed.data.skills) updateData.skills = parsed.data.skills;

  const [job] = await db.update(jobsTable)
    .set(updateData)
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(await formatJob(job));
});

router.delete("/jobs/:id", async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.sendStatus(204);
});

router.patch("/jobs/:id/status", async (req, res): Promise<void> => {
  const params = UpdateJobStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateJobStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db.update(jobsTable)
    .set({ status: parsed.data.status as any })
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(await formatJob(job));
});

export default router;
