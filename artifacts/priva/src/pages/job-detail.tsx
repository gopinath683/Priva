import { useRoute, Link, useLocation } from "wouter";
import {
  useGetJob, getGetJobQueryKey,
  useCreateApplication, getListApplicationsQueryKey,
  useListSavedJobs, getListSavedJobsQueryKey,
  useSaveJob, useUnsaveJob,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Building2, Clock, DollarSign, Globe, ArrowLeft, CheckCircle, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

const WORK_MODE_COLORS: Record<string, string> = {
  remote: "bg-emerald-100 text-emerald-700",
  hybrid: "bg-blue-100 text-blue-700",
  onsite: "bg-orange-100 text-orange-700",
};

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [applied, setApplied] = useState(false);
  const id = Number(params?.id);

  const { data: job, isLoading } = useGetJob(id, {
    query: { enabled: !!id, queryKey: getGetJobQueryKey(id) },
  });

  const applyMutation = useCreateApplication();
  const saveMutation = useSaveJob();
  const unsaveMutation = useUnsaveJob();

  const { data: savedJobs } = useListSavedJobs({
    query: { enabled: !!user && user.role === "job_seeker", queryKey: getListSavedJobsQueryKey() },
  });
  const isSaved = savedJobs?.some((s) => s.jobId === id) ?? false;

  function handleToggleSave() {
    if (!user) { navigate("/login"); return; }
    if (isSaved) {
      unsaveMutation.mutate({ jobId: id }, {
        onSuccess: () => {
          toast.success("Removed from saved jobs");
          queryClient.invalidateQueries({ queryKey: getListSavedJobsQueryKey() });
        },
      });
    } else {
      saveMutation.mutate({ data: { jobId: id } }, {
        onSuccess: () => {
          toast.success("Job saved!");
          queryClient.invalidateQueries({ queryKey: getListSavedJobsQueryKey() });
        },
        onError: (err: any) => {
          toast.error(err?.data?.error ?? "Could not save job");
        },
      });
    }
  }

  function handleApply() {
    if (!user) { navigate("/login"); return; }
    applyMutation.mutate({ data: { jobId: id } }, {
      onSuccess: () => {
        setApplied(true);
        toast.success("Application submitted successfully!");
        queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
      },
      onError: (err: any) => {
        toast.error(err?.data?.error ?? "Failed to apply. You may have already applied.");
      },
    });
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-4 w-1/3 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-xl font-medium">Job not found</p>
        <Link href="/jobs"><Button variant="outline" className="mt-4">Back to jobs</Button></Link>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>
        {user?.role === "job_seeker" && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleToggleSave}
            disabled={saveMutation.isPending || unsaveMutation.isPending}
          >
            {isSaved ? (
              <><BookmarkCheck className="h-4 w-4 text-primary" /> Saved</>
            ) : (
              <><Bookmark className="h-4 w-4" /> Save Job</>
            )}
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mb-1">{job.title}</h1>
                  {job.company && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">{job.company.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>
                {(job.salaryMin || job.salaryMax) && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    {job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}k` : ""}
                    {job.salaryMin && job.salaryMax ? " – " : ""}
                    {job.salaryMax ? `$${(job.salaryMax / 1000).toFixed(0)}k` : ""}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${WORK_MODE_COLORS[job.workMode] ?? "bg-secondary"}`}>
                  {job.workMode}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-secondary text-secondary-foreground">
                  {job.employmentType}
                </span>
                {job.experienceMin !== null && job.experienceMax !== null && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-secondary text-secondary-foreground">
                    {job.experienceMin === 0 ? "Fresher" : `${job.experienceMin}–${job.experienceMax}+ yrs exp`}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-3">Job Description</h2>
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">{job.description}</div>
            </CardContent>
          </Card>

          {job.skills && job.skills.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-sm">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              {applied ? (
                <div className="flex flex-col items-center gap-2 py-2 text-center">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                  <p className="font-semibold">Application Submitted!</p>
                  <p className="text-sm text-muted-foreground">You'll be notified of any updates.</p>
                  <Link href="/dashboard" className="text-sm text-primary hover:underline mt-1">View my applications</Link>
                </div>
              ) : (
                <>
                  <Button
                    className="w-full h-11"
                    onClick={handleApply}
                    disabled={applyMutation.isPending || !user || user.role !== "job_seeker"}
                    data-testid="button-apply"
                  >
                    {applyMutation.isPending ? "Applying..." : "Apply Now"}
                  </Button>
                  {!user && (
                    <p className="text-xs text-muted-foreground text-center">
                      <Link href="/login" className="text-primary hover:underline">Sign in</Link> to apply
                    </p>
                  )}
                </>
              )}

              <div className="border-t pt-4 space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Overview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Work mode</span>
                    <span className="font-medium capitalize">{job.workMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{job.employmentType}</span>
                  </div>
                  {(job.experienceMin !== null) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience</span>
                      <span className="font-medium">{job.experienceMin === 0 ? "Fresher" : `${job.experienceMin}+ yrs`}</span>
                    </div>
                  )}
                </div>
              </div>

              {job.company && (
                <div className="border-t pt-4 space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Company</h3>
                  <p className="font-medium">{job.company.name}</p>
                  {job.company.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{job.company.description}</p>
                  )}
                  {job.company.website && (
                    <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <Globe className="h-3.5 w-3.5" /> Website
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
