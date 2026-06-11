export function Footer() {
  return (
    <footer className="border-t bg-background py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <span className="text-lg font-bold tracking-tight">Priva.</span>
            <p className="text-sm text-muted-foreground">
              No Noise. Just Jobs That Match.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">For Job Seekers</h3>
            <a href="/jobs" className="text-sm text-muted-foreground hover:underline">Find Jobs</a>
            <a href="/register?role=job_seeker" className="text-sm text-muted-foreground hover:underline">Create Profile</a>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">For Recruiters</h3>
            <a href="/register?role=recruiter" className="text-sm text-muted-foreground hover:underline">Post a Job</a>
            <a href="/register?role=recruiter" className="text-sm text-muted-foreground hover:underline">Pricing</a>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Company</h3>
            <a href="#" className="text-sm text-muted-foreground hover:underline">About</a>
            <a href="#" className="text-sm text-muted-foreground hover:underline">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:underline">Terms</a>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Priva. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
