import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import { db, usersTable, jobsTable, applicationsTable, companiesTable } from "@workspace/db";

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
    if (u) candidate = { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt };
  }
  return { ...app, job, candidate };
}

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const [tu] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  const [tr] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.role, "recruiter"));
  const [tj] = await db.select({ count: sql<number>`count(*)::int` }).from(jobsTable);
  const [aj] = await db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(eq(jobsTable.status, "active"));
  const [pj] = await db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(eq(jobsTable.status, "pending"));
  const [ta] = await db.select({ count: sql<number>`count(*)::int` }).from(applicationsTable);

  res.json({
    totalUsers: tu?.count ?? 0,
    totalRecruiters: tr?.count ?? 0,
    totalJobs: tj?.count ?? 0,
    activeJobs: aj?.count ?? 0,
    pendingJobs: pj?.count ?? 0,
    totalApplications: ta?.count ?? 0,
  });
});

router.get("/dashboard/recruiter", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const [totalJobsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(eq(jobsTable.recruiterId, userId));
  const [activeJobsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(and(eq(jobsTable.recruiterId, userId), eq(jobsTable.status, "active")));

  const recruiterJobs = await db.select({ id: jobsTable.id }).from(jobsTable).where(eq(jobsTable.recruiterId, userId));
  const jobIds = recruiterJobs.map(j => j.id);

  let totalApplicants = 0;
  let recentApplications: any[] = [];
  let applicationStatusBreakdown: any[] = [];

  if (jobIds.length > 0) {
    const allApps = await db.select().from(applicationsTable)
      .where(sql`${applicationsTable.jobId} = ANY(ARRAY[${sql.join(jobIds.map(id => sql`${id}`), sql`, `)}]::integer[])`);

    totalApplicants = allApps.length;

    const recent = allApps.slice(-10).reverse();
    recentApplications = await Promise.all(recent.map(formatApplication));

    const statusMap: Record<string, number> = {};
    for (const a of allApps) {
      statusMap[a.status] = (statusMap[a.status] ?? 0) + 1;
    }
    applicationStatusBreakdown = Object.entries(statusMap).map(([status, count]) => ({ status, count }));
  }

  res.json({
    totalJobsPosted: totalJobsResult?.count ?? 0,
    activeJobs: activeJobsResult?.count ?? 0,
    totalApplicants,
    recentApplications,
    applicationStatusBreakdown,
  });
});

export default router;
