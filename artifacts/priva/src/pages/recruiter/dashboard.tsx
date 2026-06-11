import { useGetRecruiterDashboard, getGetRecruiterDashboardQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Briefcase, Users, TrendingUp, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  applied: { label: "Applied", className: "bg-blue-100 text-blue-700" },
  viewed: { label: "Viewed", className: "bg-yellow-100 text-yellow-700" },
  shortlisted: { label: "Shortlisted", className: "bg-purple-100 text-purple-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  interview_scheduled: { label: "Interview", className: "bg-indigo-100 text-indigo-700" },
  hired: { label: "Hired", className: "bg-green-100 text-green-700" },
};

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGetRecruiterDashboard({
    query: { queryKey: getGetRecruiterDashboardQueryKey() },
  });

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link href="/recruiter/jobs/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Post a Job</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Jobs Posted", value: data?.totalJobsPosted ?? 0, icon: Briefcase, color: "text-primary" },
          { label: "Active Jobs", value: data?.activeJobs ?? 0, icon: TrendingUp, color: "text-green-600" },
          { label: "Total Applicants", value: data?.totalApplicants ?? 0, icon: Users, color: "text-purple-600" },
          { label: "Status Types", value: data?.applicationStatusBreakdown?.length ?? 0, icon: TrendingUp, color: "text-blue-600" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              {isLoading ? <Skeleton className="h-10 w-full" /> : (
                <>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Application Status Breakdown */}
        {data?.applicationStatusBreakdown && data.applicationStatusBreakdown.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Applications by Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.applicationStatusBreakdown.map(item => {
                  const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.applied;
                  const pct = data.totalApplicants > 0 ? Math.round((item.count / data.totalApplicants) * 100) : 0;
                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.className}`}>{cfg.label}</span>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Applications</CardTitle>
              <Link href="/recruiter/jobs" className="text-sm text-primary hover:underline">View all jobs</Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : !data?.recentApplications?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.recentApplications.slice(0, 6).map(app => {
                  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.applied;
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{app.candidate?.name ?? "Applicant"}</p>
                        <p className="text-xs text-muted-foreground">{app.job?.title ?? "Job"}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.className}`}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
