import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, savedJobsTable, jobsTable, companiesTable } from "@workspace/db";

const router: IRouter = Router();

async function formatSavedJob(saved: any) {
  let job = null;
  if (saved.jobId) {
    const [j] = await db.select().from(jobsTable).where(eq(jobsTable.id, saved.jobId));
    if (j) {
      let company = null;
      if (j.companyId) {
        const [c] = await db.select().from(companiesTable).where(eq(companiesTable.id, j.companyId));
        company = c ?? null;
      }
      job = { ...j, company, skills: j.skills ?? [] };
    }
  }
  return { ...saved, job };
}

router.get("/saved-jobs", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const saved = await db.select().from(savedJobsTable)
    .where(eq(savedJobsTable.userId, userId))
    .orderBy(savedJobsTable.savedAt);

  const formatted = await Promise.all(saved.map(formatSavedJob));
  res.json(formatted);
});

router.post("/saved-jobs", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { jobId } = req.body;
  if (!jobId || typeof jobId !== "number") {
    res.status(400).json({ error: "jobId is required" });
    return;
  }

  const existing = await db.select().from(savedJobsTable)
    .where(and(eq(savedJobsTable.userId, userId), eq(savedJobsTable.jobId, jobId)));

  if (existing.length > 0) {
    res.status(400).json({ error: "Job already saved" });
    return;
  }

  const [saved] = await db.insert(savedJobsTable).values({ userId, jobId }).returning();
  res.status(201).json(await formatSavedJob(saved));
});

router.delete("/saved-jobs/:jobId", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const jobId = Number(req.params.jobId);
  if (isNaN(jobId)) { res.status(400).json({ error: "Invalid jobId" }); return; }

  const [deleted] = await db.delete(savedJobsTable)
    .where(and(eq(savedJobsTable.userId, userId), eq(savedJobsTable.jobId, jobId)))
    .returning();

  if (!deleted) { res.status(404).json({ error: "Saved job not found" }); return; }

  res.sendStatus(204);
});

export default router;
