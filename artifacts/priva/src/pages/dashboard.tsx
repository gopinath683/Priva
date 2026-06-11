import { useListApplications, getListApplicationsQueryKey, useListSavedJobs, getListSavedJobsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Briefcase, Clock, Building2, MapPin, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  applied: { label: "Applied", className: "bg-blue-100 text-blue-700 border-blue-200" },
  viewed: { label: "Viewed", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  shortlisted: { label: "Shortlisted", className: "bg-purple-100 text-purple-700 border-purple-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200" },
  interview_scheduled: { label: "Interview Scheduled", className: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  hired: { label: "Hired", className: "bg-green-100 text-green-700 border-green-200" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: applications, isLoading } = useListApplications(undefined, {
    query: { queryKey: getListApplicationsQueryKey() },
  });
  const { data: savedJobs } = useListSavedJobs({
    query: { queryKey: getListSavedJobsQueryKey() },
  });

  const apps = applications ?? [];
  const saved = savedJobs ?? [];
  const statusCounts = apps.reduce((acc: Record<string, number>, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Applied", value: apps.length, color: "text-primary", href: undefined },
          { label: "Saved Jobs", value: saved.length, color: "text-amber-600", href: "/saved-jobs" },
          { label: "Interviews", value: statusCounts.interview_scheduled ?? 0, color: "text-indigo-600", href: undefined },
          { label: "Hired", value: statusCounts.hired ?? 0, color: "text-green-600", href: undefined },
        ].map(stat => (
          <Card key={stat.label} className={stat.href ? "cursor-pointer hover:border-primary/40 transition-colors" : ""}>
            {stat.href ? (
              <Link href={stat.href}>
                <CardContent className="p-4 text-center">
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <Bookmark className="h-3.5 w-3.5" /> {stat.label}
                  </p>
                </CardContent>
              </Link>
            ) : (
              <CardContent className="p-4 text-center">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No applications yet</p>
              <p className="text-sm mt-1">
                <Link href="/jobs" className="text-primary hover:underline">Browse jobs</Link> to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map(app => {
                const statusCfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.applied;
                return (
                  <div key={app.id} className="flex items-start justify-between gap-4 p-4 border rounded-xl hover:bg-muted/30 transition-colors" data-testid={`app-item-${app.id}`}>
                    <div className="flex-1 min-w-0">
                      {app.job ? (
                        <>
                          <Link href={`/jobs/${app.job.id}`} className="font-semibold hover:text-primary transition-colors">
                            {app.job.title}
                          </Link>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                            {app.job.company && (
                              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{app.job.company.name}</span>
                            )}
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{app.job.location}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Applied {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}</span>
                          </div>
                        </>
                      ) : (
                        <p className="font-medium text-muted-foreground">Job no longer available</p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap ${statusCfg.className}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
