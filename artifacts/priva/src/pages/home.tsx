import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { Search, MapPin, Building2, ChevronRight, TrendingUp, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { useGetFeaturedJobs, getGetFeaturedJobsQueryKey } from "@workspace/api-client-react";

const WORK_MODE_COLORS: Record<string, string> = {
  remote: "bg-emerald-100 text-emerald-700",
  hybrid: "bg-blue-100 text-blue-700",
  onsite: "bg-orange-100 text-orange-700",
};

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [, navigate] = useLocation();

  const { data: featuredJobs, isLoading } = useGetFeaturedJobs({
    query: { queryKey: getGetFeaturedJobsQueryKey() },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (location) params.append("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative px-4 pt-24 pb-32 md:px-6 md:pt-32 md:pb-40 overflow-hidden border-b bg-muted/30">
        <div className="container relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-primary/10 text-primary">
            No Noise. Just Jobs That Match.
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-tight">
            Find your next role with <span className="text-primary">precision</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            A focused, signal-over-noise job platform for serious professionals.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-3xl flex flex-col sm:flex-row gap-2 mt-8 bg-card p-2 rounded-2xl shadow-lg border">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Job title, keyword, or company"
                className="pl-12 h-14 border-0 shadow-none focus-visible:ring-0 text-base"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="w-px bg-border hidden sm:block mx-2 my-2" />
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="City, state, or 'Remote'"
                className="pl-12 h-14 border-0 shadow-none focus-visible:ring-0 text-base"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 rounded-xl text-base w-full sm:w-auto">
              Search Jobs
            </Button>
          </form>
        </div>
      </section>

      {/* Why Priva */}
      <section className="py-16 px-4 md:px-6 bg-background">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "No Spam", desc: "Only verified, high-quality job postings. We curate so you don't have to." },
              { icon: TrendingUp, title: "Precision Matching", desc: "Filter by experience level, work mode, salary, and skills to find your perfect role." },
              { icon: Zap, title: "Fast Applications", desc: "Apply in seconds with your Priva profile. Track every application in one place." },
            ].map(item => (
              <div key={item.title} className="flex flex-col gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 px-4 md:px-6 bg-muted/20 border-y">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Featured Jobs</h2>
              <p className="text-muted-foreground text-sm mt-1">Hand-picked opportunities for you</p>
            </div>
            <Link href="/jobs">
              <Button variant="outline" className="gap-1.5">View all <ChevronRight className="h-4 w-4" /></Button>
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="h-5 w-1/2 mb-3" />
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : (featuredJobs ?? []).slice(0, 6).map(job => (
              <Link href={`/jobs/${job.id}`} key={job.id}>
                <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-5 h-full flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold group-hover:text-primary transition-colors leading-tight">{job.title}</h3>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                    {job.company && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{job.company.name}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${WORK_MODE_COLORS[job.workMode] ?? "bg-secondary"}`}>
                        {job.workMode}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground">
                        {job.location}
                      </span>
                      {(job.salaryMin || job.salaryMax) && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground">
                          {job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}k` : ""}
                          {job.salaryMin && job.salaryMax ? "–" : ""}
                          {job.salaryMax ? `$${(job.salaryMax / 1000).toFixed(0)}k` : ""}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-6 bg-primary text-primary-foreground">
        <div className="container max-w-3xl mx-auto text-center flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to find your next role?</h2>
          <p className="text-primary-foreground/80 text-lg">Join thousands of professionals who use Priva to cut through the noise.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8 h-12">Get Started — It's Free</Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="px-8 h-12 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">Browse Jobs</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
