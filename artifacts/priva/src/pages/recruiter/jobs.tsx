import { useListJobs, useDeleteJob, getListJobsQueryKey, useUpdateJobStatus } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-700",
};

export default function RecruiterJobs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const params = { status: undefined as any };
  const { data, isLoading } = useListJobs(params, { query: { queryKey: getListJobsQueryKey(params) } });
  const deleteMutation = useDeleteJob();
  const statusMutation = useUpdateJobStatus();

  const jobs = data?.jobs ?? [];

  function handleDelete(id: number) {
    if (!confirm("Delete this job posting?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Job deleted");
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
      },
    });
  }

  function toggleStatus(id: number, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    statusMutation.mutate({ id, data: { status: newStatus as any } }, {
      onSuccess: () => {
        toast.success(`Job ${newStatus === "active" ? "activated" : "deactivated"}`);
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
      },
    });
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Job Postings</h1>
          <p className="text-muted-foreground mt-1">{jobs.length} job{jobs.length !== 1 ? "s" : ""} posted</p>
        </div>
        <Link href="/recruiter/jobs/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Post a Job</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-2xl">
          <p className="font-medium">No jobs posted yet</p>
          <Link href="/recruiter/jobs/new">
            <Button variant="outline" className="mt-4 gap-2"><Plus className="h-4 w-4" /> Post your first job</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <Card key={job.id} data-testid={`job-card-${job.id}`}>
              <CardContent className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold">{job.title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status]}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{job.location} · {job.workMode} · {job.employmentType}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/recruiter/jobs/${job.id}/applicants`}>
                    <Button variant="outline" size="sm">View Applicants</Button>
                  </Link>
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => toggleStatus(job.id, job.status)}
                    title={job.status === "active" ? "Deactivate" : "Activate"}
                  >
                    {job.status === "active" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Link href={`/recruiter/jobs/${job.id}/edit`}>
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
