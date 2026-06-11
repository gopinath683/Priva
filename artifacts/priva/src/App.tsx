import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/lib/protected-route";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import Jobs from "@/pages/jobs";
import JobDetail from "@/pages/job-detail";
import Dashboard from "@/pages/dashboard";
import SavedJobs from "@/pages/saved-jobs";
import Profile from "@/pages/profile";
import RecruiterDashboard from "@/pages/recruiter/dashboard";
import RecruiterJobs from "@/pages/recruiter/jobs";
import PostJob from "@/pages/recruiter/post-job";
import Applicants from "@/pages/recruiter/applicants";
import RecruiterCompany from "@/pages/recruiter/company";
import AdminDashboard from "@/pages/admin/index";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        {/* Public */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/jobs/:id" component={JobDetail} />

        {/* Job seeker protected */}
        <Route path="/dashboard">
          {() => <ProtectedRoute component={Dashboard} allowedRoles={["job_seeker"]} />}
        </Route>
        <Route path="/profile">
          {() => <ProtectedRoute component={Profile} allowedRoles={["job_seeker"]} />}
        </Route>
        <Route path="/saved-jobs">
          {() => <ProtectedRoute component={SavedJobs} allowedRoles={["job_seeker"]} />}
        </Route>

        {/* Recruiter protected */}
        <Route path="/recruiter/dashboard">
          {() => <ProtectedRoute component={RecruiterDashboard} allowedRoles={["recruiter"]} />}
        </Route>
        <Route path="/recruiter/jobs">
          {() => <ProtectedRoute component={RecruiterJobs} allowedRoles={["recruiter"]} />}
        </Route>
        <Route path="/recruiter/jobs/new">
          {() => <ProtectedRoute component={PostJob} allowedRoles={["recruiter"]} />}
        </Route>
        <Route path="/recruiter/jobs/:id/applicants">
          {() => <ProtectedRoute component={Applicants} allowedRoles={["recruiter"]} />}
        </Route>
        <Route path="/recruiter/company">
          {() => <ProtectedRoute component={RecruiterCompany} allowedRoles={["recruiter"]} />}
        </Route>

        {/* Admin protected */}
        <Route path="/admin">
          {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster richColors closeButton />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
