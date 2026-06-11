import { db, usersTable, companiesTable, jobsTable } from "@workspace/db";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "priva_salt_2024").digest("hex");
}

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data in correct order
  await db.delete(jobsTable);
  await db.delete(companiesTable);
  await db.delete(usersTable);

  // Users
  const [admin] = await db.insert(usersTable).values({
    name: "Admin User",
    email: "admin@priva.dev",
    password: hashPassword("admin123"),
    role: "admin",
  }).returning();

  const [recruiter1] = await db.insert(usersTable).values({
    name: "Sarah Chen",
    email: "sarah@techcorp.com",
    password: hashPassword("recruiter123"),
    role: "recruiter",
  }).returning();

  const [recruiter2] = await db.insert(usersTable).values({
    name: "Marcus Wright",
    email: "marcus@startupxyz.io",
    password: hashPassword("recruiter123"),
    role: "recruiter",
  }).returning();

  await db.insert(usersTable).values({
    name: "Alex Johnson",
    email: "alex@jobseeker.com",
    password: hashPassword("seeker123"),
    role: "job_seeker",
  });

  await db.insert(usersTable).values({
    name: "Jamie Rivera",
    email: "jamie@jobseeker.com",
    password: hashPassword("seeker123"),
    role: "job_seeker",
  });

  console.log("✅ Users created");

  // Companies
  const [techcorp] = await db.insert(companiesTable).values({
    recruiterId: recruiter1.id,
    name: "TechCorp",
    website: "https://techcorp.example.com",
    description: "A leading software company building enterprise SaaS solutions used by 10,000+ businesses worldwide.",
  }).returning();

  const [startupxyz] = await db.insert(companiesTable).values({
    recruiterId: recruiter2.id,
    name: "StartupXYZ",
    website: "https://startupxyz.example.io",
    description: "Fast-moving fintech startup revolutionizing payments for small businesses.",
  }).returning();

  console.log("✅ Companies created");

  // Jobs
  await db.insert(jobsTable).values([
    {
      companyId: techcorp.id,
      recruiterId: recruiter1.id,
      title: "Senior Frontend Engineer",
      description: "We're looking for a Senior Frontend Engineer to join our growing product team.\n\nResponsibilities:\n- Build responsive, performant React applications\n- Collaborate with design and backend teams\n- Mentor junior developers\n- Lead architecture decisions for frontend systems\n\nYou'll be working on our flagship dashboard used by enterprise clients.",
      skills: ["React", "TypeScript", "TailwindCSS", "GraphQL"],
      location: "San Francisco, CA",
      experienceMin: 4,
      experienceMax: 8,
      salaryMin: 140000,
      salaryMax: 190000,
      workMode: "hybrid",
      employmentType: "full-time",
      status: "active",
    },
    {
      companyId: techcorp.id,
      recruiterId: recruiter1.id,
      title: "Backend Engineer – Node.js",
      description: "Join our backend team to design and build scalable microservices.\n\nWhat you'll do:\n- Architect and build RESTful APIs and GraphQL services\n- Optimize database queries and manage PostgreSQL at scale\n- Implement CI/CD pipelines\n- Work closely with product on new features",
      skills: ["Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
      location: "New York, NY",
      experienceMin: 3,
      experienceMax: 6,
      salaryMin: 130000,
      salaryMax: 170000,
      workMode: "remote",
      employmentType: "full-time",
      status: "active",
    },
    {
      companyId: techcorp.id,
      recruiterId: recruiter1.id,
      title: "Junior QA Engineer",
      description: "We're looking for an entry-level QA Engineer who is passionate about software quality.\n\nYou'll write test cases, perform manual and automated testing, and work with developers to fix bugs.\n\nGreat opportunity for recent graduates or career changers.",
      skills: ["Testing", "Selenium", "JIRA"],
      location: "Austin, TX",
      experienceMin: 0,
      experienceMax: 1,
      salaryMin: 60000,
      salaryMax: 80000,
      workMode: "onsite",
      employmentType: "full-time",
      status: "active",
    },
    {
      companyId: startupxyz.id,
      recruiterId: recruiter2.id,
      title: "Full Stack Engineer",
      description: "Exciting opportunity to be an early-stage employee at a Series A fintech startup.\n\nYou'll wear multiple hats — building features across the stack, deploying infrastructure, and influencing product direction.\n\nWe move fast, iterate quickly, and ship often.",
      skills: ["React", "Node.js", "PostgreSQL", "Stripe API"],
      location: "Remote",
      experienceMin: 2,
      experienceMax: 5,
      salaryMin: 110000,
      salaryMax: 150000,
      workMode: "remote",
      employmentType: "full-time",
      status: "active",
    },
    {
      companyId: startupxyz.id,
      recruiterId: recruiter2.id,
      title: "Product Designer",
      description: "We need a talented product designer to own the end-to-end design of our payment dashboard.\n\nYou'll create wireframes, high-fidelity designs, and prototypes. Work directly with the CEO and engineering team.",
      skills: ["Figma", "User Research", "Design Systems", "Prototyping"],
      location: "New York, NY",
      experienceMin: 2,
      experienceMax: 5,
      salaryMin: 100000,
      salaryMax: 130000,
      workMode: "hybrid",
      employmentType: "full-time",
      status: "active",
    },
    {
      companyId: startupxyz.id,
      recruiterId: recruiter2.id,
      title: "Data Analyst (Part-Time)",
      description: "Looking for a part-time data analyst to help us understand payment trends and customer behavior.\n\nYou'll work ~20 hours/week, building dashboards in Metabase, running SQL queries, and delivering weekly insights reports.",
      skills: ["SQL", "Python", "Metabase", "Data Visualization"],
      location: "Remote",
      experienceMin: 1,
      experienceMax: 3,
      salaryMin: 40000,
      salaryMax: 60000,
      workMode: "remote",
      employmentType: "part-time",
      status: "active",
    },
    {
      companyId: techcorp.id,
      recruiterId: recruiter1.id,
      title: "DevOps Engineer",
      description: "We're scaling our infrastructure and need a DevOps engineer to lead the effort.\n\nYou'll manage Kubernetes clusters, optimize CI/CD, and work on reliability engineering.",
      skills: ["Kubernetes", "AWS", "Terraform", "Docker", "Linux"],
      location: "San Francisco, CA",
      experienceMin: 5,
      experienceMax: 10,
      salaryMin: 160000,
      salaryMax: 210000,
      workMode: "hybrid",
      employmentType: "full-time",
      status: "active",
    },
    {
      companyId: startupxyz.id,
      recruiterId: recruiter2.id,
      title: "Mobile Developer – React Native",
      description: "Build our consumer-facing mobile app from scratch. This is a greenfield project — you'll have full ownership.",
      skills: ["React Native", "TypeScript", "Expo", "iOS", "Android"],
      location: "Remote",
      experienceMin: 2,
      experienceMax: 6,
      salaryMin: 120000,
      salaryMax: 160000,
      workMode: "remote",
      employmentType: "full-time",
      status: "active",
    },
  ]);

  console.log("✅ Jobs created");
  console.log("\n📋 Demo credentials:");
  console.log("  Admin:     admin@priva.dev / admin123");
  console.log("  Recruiter: sarah@techcorp.com / recruiter123");
  console.log("  Recruiter: marcus@startupxyz.io / recruiter123");
  console.log("  Seeker:    alex@jobseeker.com / seeker123");
  console.log("  Seeker:    jamie@jobseeker.com / seeker123");
  console.log("\n✨ Seed complete!");
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
