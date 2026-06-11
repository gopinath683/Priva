import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, profilesTable } from "@workspace/db";
import { UpdateProfileBody, GetProfileByUserIdParams } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

async function formatProfile(profile: any, userId: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return {
    ...profile,
    skills: profile.skills ?? [],
    user: user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    } : null,
  };
}

router.get("/profile", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(await formatProfile(profile, userId));
});

router.put("/profile", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));

  let profile;
  if (existing.length > 0) {
    const [updated] = await db.update(profilesTable)
      .set({ ...parsed.data, skills: parsed.data.skills ?? [] })
      .where(eq(profilesTable.userId, userId))
      .returning();
    profile = updated;
  } else {
    const [created] = await db.insert(profilesTable)
      .values({ userId, ...parsed.data, skills: parsed.data.skills ?? [] })
      .returning();
    profile = created;
  }

  res.json(await formatProfile(profile, userId));
});

router.get("/profile/:userId", async (req, res): Promise<void> => {
  const params = GetProfileByUserIdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, params.data.userId));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(await formatProfile(profile, params.data.userId));
});

export default router;
