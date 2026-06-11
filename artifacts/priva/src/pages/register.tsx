import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Briefcase, User } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["job_seeker", "recruiter"]),
});

export default function Register() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "job_seeker" },
  });

  const registerMutation = useRegisterUser();

  function onSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate({ data: values }, {
      onSuccess: (user) => {
        login(user);
        toast.success("Account created successfully!");
        setLocation(user.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard");
      },
      onError: (err: any) => {
        toast.error(err?.data?.error ?? "Registration failed. Please try again.");
      },
    });
  }

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
          <CardDescription>Join Priva and find your next opportunity</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-3"
                      >
                        <Label
                          htmlFor="job_seeker"
                          className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-colors ${field.value === "job_seeker" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/40"}`}
                        >
                          <RadioGroupItem value="job_seeker" id="job_seeker" className="sr-only" />
                          <User className="h-6 w-6 mb-2 text-primary" />
                          <span className="font-medium text-sm">Job Seeker</span>
                          <span className="text-xs text-muted-foreground mt-0.5">Find your next role</span>
                        </Label>
                        <Label
                          htmlFor="recruiter"
                          className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-colors ${field.value === "recruiter" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/40"}`}
                        >
                          <RadioGroupItem value="recruiter" id="recruiter" className="sr-only" />
                          <Briefcase className="h-6 w-6 mb-2 text-primary" />
                          <span className="font-medium text-sm">Recruiter</span>
                          <span className="text-xs text-muted-foreground mt-0.5">Hire top talent</span>
                        </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Smith" {...field} data-testid="input-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="john@example.com" {...field} data-testid="input-email" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="At least 6 characters" {...field} data-testid="input-password" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={registerMutation.isPending} data-testid="button-submit">
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground text-center w-full">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
