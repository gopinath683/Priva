import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListJobs, getListJobsQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Building2, Clock, DollarSign, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

const EXPERIENCE_FILTERS = [
  { label: "Fresher", value: "fresher" },
  { label: "1–3 Years", value: "1-3" },
  { label: "3–5 Years", value: "3-5" },
  { label: "5+ Years", value: "5+" },
];

const WORK_MODE_FILTERS = [
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "On-site", value: "onsite" },
];

const EMPLOYMENT_FILTERS = [
  { label: "Full-Time", value: "full-time" },
  { label: "Part-Time", value: "part-time" },
];

const WORK_MODE_COLORS: Record<string, string> = {
  remote: "bg-emerald-100 text-emerald-700 border-emerald-200",
  hybrid: "bg-blue-100 text-blue-700 border-blue-200",
  onsite: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function Jobs() {
  const [, navigate] = useLocation();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [activeExp, setActiveExp] = useState<string | undefined>(undefined);
  const [activeWorkMode, setActiveWorkMode] = useState<string | undefined>(undefined);
  const [activeEmpType, setActiveEmpType] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const params = {
    keyword: keyword || undefined,
    location: location || undefined,
    experienceLevel: activeExp as any,
    workMode: activeWorkMode as any,
    employmentType: activeEmpType as any,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const { data, isLoading } = useListJobs(params, {
    query: { queryKey: getListJobsQueryKey(params) },
  });

  const jobs = data?.jobs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function toggleFilter<T>(val: T, current: T | undefined, set: (v: T | undefined) => void) {
    set(current === val ? undefined : val);
    setPage(0);
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Find Jobs</h1>
        <p className="text-muted-foreground">{total} jobs available</p>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6 bg-card border rounded-xl p-2 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Job title or keyword"
            className="pl-9 border-0 shadow-none focus-visible:ring-0"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
            data-testid="input-search"
          />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Location"
            className="pl-9 border-0 shadow-none focus-visible:ring-0"
            value={location}
            onChange={(e) => { setLocation(e.target.value); setPage(0); }}
            data-testid="input-location"
          />
        </div>
        <Button className="px-6" data-testid="button-search">Search</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {EXPERIENCE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => toggleFilter(f.value, activeExp, setActiveExp)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${activeExp === f.value ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:border-primary/50"}`}
            data-testid={`filter-exp-${f.value}`}
          >
            {f.label}
          </button>
        ))}
        <div className="w-px bg-border mx-1" />
        {WORK_MODE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => toggleFilter(f.value, activeWorkMode, setActiveWorkMode)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${activeWorkMode === f.value ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:border-primary/50"}`}
            data-testid={`filter-mode-${f.value}`}
          >
            {f.label}
          </button>
        ))}
        <div className="w-px bg-border mx-1" />
        {EMPLOYMENT_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => toggleFilter(f.value, activeEmpType, setActiveEmpType)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${activeEmpType === f.value ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:border-primary/50"}`}
            data-testid={`filter-type-${f.value}`}
          >
            {f.label}
          </button>
        ))}
        {(activeExp || activeWorkMode || activeEmpType) && (
          <button
            onClick={() => { setActiveExp(undefined); setActiveWorkMode(undefined); setActiveEmpType(undefined); setPage(0); }}
            className="px-3 py-1.5 rounded-full text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/5 transition-all"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Job list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-5 w-1/3 mb-3" />
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No jobs found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          jobs.map(job => (
            <Link href={`/jobs/${job.id}`} key={job.id}>
              <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group" data-testid={`card-job-${job.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">{job.title}</h2>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
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
                            {job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}k` : ""}
                            {job.salaryMin && job.salaryMax ? " – " : ""}
                            {job.salaryMax ? `$${(job.salaryMax / 1000).toFixed(0)}k` : ""}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${WORK_MODE_COLORS[job.workMode] ?? ""}`}>
                          {job.workMode}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-secondary text-secondary-foreground font-medium">
                          {job.employmentType}
                        </span>
                        {job.experienceMin === 0 || (!job.experienceMin && !job.experienceMax) ? (
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-purple-100 text-purple-700 border-purple-200 font-medium">Fresher</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-secondary text-secondary-foreground font-medium">
                            {job.experienceMin}–{job.experienceMax ?? "+"} yrs
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
