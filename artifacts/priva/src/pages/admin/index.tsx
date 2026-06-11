import { useGetDashboardStats, useListUsers, useDeleteUser, useListAllJobs, useUpdateJobStatus, getGetDashboardStatsQueryKey, getListUsersQueryKey, getListAllJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, Briefcase, TrendingUp, CheckCircle, XCircle, Trash2, Building2, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ROLE_COLORS: Record<string, string> = {
  job_seeker: "bg-blue-100 text-blue-700",
  recruiter: "bg-purple-100 text-purple-700",
  admin: "bg-red-100 text-red-700",
};

const JOB_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-700",
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: users, isLoading: usersLoading } = useListUsers(undefined, { query: { queryKey: getListUsersQueryKey() } });
  const { data: jobs, isLoading: jobsLoading } = useListAllJobs({ query: { queryKey: getListAllJobsQueryKey() } });

  const deleteMutation = useDeleteUser();
  const jobStatusMutation = useUpdateJobStatus();

  function handleDeleteUser(id: number) {
    if (!confirm("Delete this user?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("User deleted");
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
    });
  }

  function handleJobStatus(id: number, status: "active" | "inactive") {
    jobStatusMutation.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast.success(`Job ${status === "active" ? "approved" : "rejected"}`);
        queryClient.invalidateQueries({ queryKey: getListAllJobsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
    });
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-primary" },
    { label: "Recruiters", value: stats?.totalRecruiters, icon: Building2, color: "text-purple-600" },
    { label: "Total Jobs", value: stats?.totalJobs, icon: Briefcase, color: "text-blue-600" },
    { label: "Active Jobs", value: stats?.activeJobs, icon: TrendingUp, color: "text-green-600" },
    { label: "Pending Jobs", value: stats?.pendingJobs, icon: Briefcase, color: "text-yellow-600" },
    { label: "Applications", value: stats?.totalApplications, icon: CheckCircle, color: "text-indigo-600" },
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(card => (
          <Card key={card.label}>
            <CardContent className="p-4 text-center">
              {statsLoading ? <Skeleton className="h-10 w-full" /> : (
                <>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="jobs">
        <TabsList className="mb-6">
          <TabsTrigger value="jobs">Manage Jobs</TabsTrigger>
          <TabsTrigger value="users">Manage Users</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader><CardTitle className="text-base">All Job Postings</CardTitle></CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
              ) : (
                <div className="space-y-2">
                  {(jobs ?? []).map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-3 rounded-xl border" data-testid={`admin-job-${job.id}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{job.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${JOB_STATUS_COLORS[job.status]}`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                          <span>{formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleJobStatus(job.id, "active")}>
                              <CheckCircle className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleJobStatus(job.id, "inactive")}>
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </>
                        )}
                        {job.status === "active" && (
                          <Button size="sm" variant="ghost" onClick={() => handleJobStatus(job.id, "inactive")}>Deactivate</Button>
                        )}
                        {job.status === "inactive" && (
                          <Button size="sm" variant="ghost" onClick={() => handleJobStatus(job.id, "active")}>Activate</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle className="text-base">All Users</CardTitle></CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : (
                <div className="space-y-2">
                  {(users ?? []).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-xl border" data-testid={`admin-user-${user.id}`}>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user.role] ?? ""}`}>
                          {user.role.replace("_", " ")}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
