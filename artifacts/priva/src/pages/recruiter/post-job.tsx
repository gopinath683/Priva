import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateJob, getListJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Plus, ArrowLeft } from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description is too short"),
  location: z.string().min(1, "Location is required"),
  workMode: z.enum(["remote", "hybrid", "onsite"]),
  employmentType: z.enum(["full-time", "part-time"]),
  experienceMin: z.coerce.number().int().min(0).optional().or(z.literal("")),
  experienceMax: z.coerce.number().int().min(0).optional().or(z.literal("")),
  salaryMin: z.coerce.number().int().min(0).optional().or(z.literal("")),
  salaryMax: z.coerce.number().int().min(0).optional().or(z.literal("")),
});

export default function PostJob() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const createMutation = useCreateJob();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "", description: "", location: "", workMode: "onsite", employmentType: "full-time",
      experienceMin: "", experienceMax: "", salaryMin: "", salaryMax: "",
    },
  });

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput("");
  }

  function onSubmit(values: z.infer<typeof schema>) {
    const data: any = {
      ...values,
      skills,
      experienceMin: values.experienceMin === "" ? null : Number(values.experienceMin),
      experienceMax: values.experienceMax === "" ? null : Number(values.experienceMax),
      salaryMin: values.salaryMin === "" ? null : Number(values.salaryMin),
      salaryMax: values.salaryMax === "" ? null : Number(values.salaryMax),
    };
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast.success("Job posted successfully!");
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
        navigate("/recruiter/jobs");
      },
      onError: () => { toast.error("Failed to post job."); },
    });
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
      <Link href="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>
      <Card>
        <CardHeader><CardTitle className="text-xl">Post a New Job</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl><Input placeholder="Senior Frontend Engineer" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe the role, responsibilities, and requirements..." {...field} rows={5} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl><Input placeholder="New York, NY" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="workMode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="employmentType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="experienceMin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Experience (yrs)</FormLabel>
                    <FormControl><Input type="number" min="0" placeholder="0 = Fresher" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="experienceMax" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Experience (yrs)</FormLabel>
                    <FormControl><Input type="number" min="0" placeholder="5" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="salaryMin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Salary ($)</FormLabel>
                    <FormControl><Input type="number" min="0" placeholder="60000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="salaryMax" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Salary ($)</FormLabel>
                    <FormControl><Input type="number" min="0" placeholder="120000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div>
                <FormLabel>Required Skills</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2 mb-2 min-h-[2rem]">
                  {skills.map(s => (
                    <Badge key={s} variant="secondary" className="gap-1.5 pr-1">
                      {s}
                      <button type="button" onClick={() => setSkills(prev => prev.filter(x => x !== s))}>
                        <X className="h-3 w-3 hover:text-destructive" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    placeholder="Add a skill (press Enter)"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Posting..." : "Post Job"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
