import { useRoute, Link } from "wouter";
import { useListApplications, useUpdateApplicationStatus, getListApplicationsQueryKey, useGetJob, getGetJobQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUSES = [
  { value: "applied", label: "Applied" },
  { value: "viewed", label: "Viewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "hired", label: "Hired" },
];

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700",
  viewed: "bg-yellow-100 text-yellow-700",
  shortlisted: "bg-purple-100 text-purple-700",
  rejected: "bg-red-100 text-red-700",
  interview_scheduled: "bg-indigo-100 text-indigo-700",
  hired: "bg-green-100 text-green-700",
};

export default function Applicants() {
  const [, params] = useRoute("/recruiter/jobs/:id/applicants");
  const queryClient = useQueryClient();
  const jobId = Number(params?.id);

  const { data: job } = useGetJob(jobId, { query: { enabled: !!jobId, queryKey: getGetJobQueryKey(jobId) } });
  const jobIdParams = { jobId };
  const { data: applications, isLoading } = useListApplications(jobIdParams as any, {
    query: { enabled: !!jobId, queryKey: getListApplicationsQueryKey(jobIdParams as any) },
  });

  const statusMutation = useUpdateApplicationStatus();

  const apps = applications ?? [];

  function handleStatusChange(appId: number, status: string) {
    statusMutation.mutate({ id: appId, data: { status: status as any } }, {
      onSuccess: () => {
        toast.success("Status updated");
        queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey(jobIdParams as any) });
      },
    });
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
      <Link href="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Applicants</h1>
        {job && <p className="text-muted-foreground mt-1">For: {job.title} · {apps.length} applicant{apps.length !== 1 ? "s" : ""}</p>}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : apps.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-2xl">
          <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No applicants yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <Card key={app.id} data-testid={`applicant-${app.id}`}>
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{app.candidate?.name ?? "Applicant"}</p>
                      <p className="text-sm text-muted-foreground">{app.candidate?.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 ml-10">
                    Applied {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[app.status]}`}>
                    {STATUSES.find(s => s.value === app.status)?.label ?? app.status}
                  </span>
                  <Select value={app.status} onValueChange={(val) => handleStatusChange(app.id, val)}>
                    <SelectTrigger className="w-44 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
