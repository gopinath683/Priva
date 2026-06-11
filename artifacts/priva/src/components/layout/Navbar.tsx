import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Briefcase, LayoutDashboard, User, Building2, Menu, X, Bookmark } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "recruiter"
      ? "/recruiter/dashboard"
      : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="text-lg">Priva.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/jobs" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/jobs" ? "text-primary" : "text-muted-foreground"}`}>
            Find Jobs
          </Link>
          {user?.role === "recruiter" && (
            <>
              <Link href="/recruiter/jobs" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith("/recruiter/jobs") ? "text-primary" : "text-muted-foreground"}`}>
                My Jobs
              </Link>
              <Link href="/recruiter/company" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/recruiter/company" ? "text-primary" : "text-muted-foreground"}`}>
                Company
              </Link>
            </>
          )}
          {!user && (
            <Link href="/register?role=recruiter" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Post a Job
            </Link>
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{user.name.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={dashboardPath} className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                {user.role === "job_seeker" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/saved-jobs" className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4" /> Saved Jobs
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === "recruiter" && (
                  <DropdownMenuItem asChild>
                    <Link href="/recruiter/company" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Company
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          <Link href="/jobs" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Find Jobs</Link>
          {user ? (
            <>
              <Link href={dashboardPath} className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              {user.role === "job_seeker" && (
                <>
                  <Link href="/saved-jobs" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Saved Jobs</Link>
                  <Link href="/profile" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>My Profile</Link>
                </>
              )}
              {user.role === "recruiter" && (
                <>
                  <Link href="/recruiter/jobs" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>My Jobs</Link>
                  <Link href="/recruiter/company" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Company</Link>
                </>
              )}
              <button onClick={() => { logout(); setMobileOpen(false); }} className="block text-sm font-medium py-2 text-destructive w-full text-left">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/register" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
