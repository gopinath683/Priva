import { useListSavedJobs, useUnsaveJob, getListSavedJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Bookmark, Building2, MapPin, DollarSign, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const WORK_MODE_COLORS: Record<string, string> = {
  remote: "bg-emerald-100 text-emerald-700 border-emerald-200",
  hybrid: "bg-blue-100 text-blue-700 border-blue-200",
  onsite: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function SavedJobs() {
  const queryClient = useQueryClient();
  const { data: savedJobs, isLoading } = useListSavedJobs({
    query: { queryKey: getListSavedJobsQueryKey() },
  });

  const unsaveMutation = useUnsaveJob();

  function handleUnsave(jobId: number) {
    unsaveMutation.mutate({ jobId }, {
      onSuccess: () => {
        toast.success("Job removed from saved");
        queryClient.invalidateQueries({ queryKey: getListSavedJobsQueryKey() });
      },
      onError: () => toast.error("Failed to remove saved job"),
    });
  }

  const jobs = savedJobs ?? [];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
        <p className="text-muted-foreground mt-1">
          {jobs.length} job{jobs.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-5 w-1/3 mb-3" />
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-2xl">
          <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No saved jobs yet</p>
          <p className="text-sm mt-1">
            <Link href="/jobs" className="text-primary hover:underline">
              Browse jobs
            </Link>{" "}
            and bookmark ones you like
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((saved) => {
            const job = saved.job;
            if (!job) return null;
            return (
              <Card
                key={saved.id}
                className="hover:border-primary/40 hover:shadow-sm transition-all"
                data-testid={`saved-job-${saved.id}`}
              >
                <CardContent className="p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/jobs/${job.id}`}>
                      <h2 className="font-semibold text-base hover:text-primary transition-colors leading-tight">
                        {job.title}
                      </h2>
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                      {job.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {job.company.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                      {(job.salaryMin || job.salaryMax) && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          {job.salaryMin
                            ? `$${(job.salaryMin / 1000).toFixed(0)}k`
                            : ""}
                          {job.salaryMin && job.salaryMax ? "–" : ""}
                          {job.salaryMax
                            ? `$${(job.salaryMax / 1000).toFixed(0)}k`
                            : ""}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Saved{" "}
                        {formatDistanceToNow(new Date(saved.savedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${WORK_MODE_COLORS[job.workMode] ?? ""}`}
                      >
                        {job.workMode}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full border bg-secondary text-secondary-foreground font-medium">
                        {job.employmentType}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnsave(job.id)}
                      disabled={unsaveMutation.isPending}
                      title="Remove from saved"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
