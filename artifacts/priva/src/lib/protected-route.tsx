import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";

export function ProtectedRoute({
  component: Component,
  allowedRoles,
  ...rest
}: {
  component: React.ComponentType<any>;
  allowedRoles?: string[];
  [key: string]: any;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    setLocation(user.role === 'admin' ? '/admin' : user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard');
    return null;
  }

  return <Component {...rest} />;
}
