import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";

const profileSchema = z.object({
  phone: z.string().optional(),
  location: z.string().optional(),
  education: z.string().optional(),
  experienceYears: z.coerce.number().int().min(0).optional().or(z.literal("")),
  expectedSalary: z.coerce.number().int().min(0).optional().or(z.literal("")),
  resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });
  const updateMutation = useUpdateProfile();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { phone: "", location: "", education: "", experienceYears: "", expectedSalary: "", resumeUrl: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        phone: profile.phone ?? "",
        location: profile.location ?? "",
        education: profile.education ?? "",
        experienceYears: profile.experienceYears ?? "",
        expectedSalary: profile.expectedSalary ?? "",
        resumeUrl: profile.resumeUrl ?? "",
      });
      setSkills(profile.skills ?? []);
    }
  }, [profile]);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills(prev => prev.filter(s => s !== skill));
  }

  function onSubmit(values: z.infer<typeof profileSchema>) {
    const data: any = {
      skills,
      phone: values.phone || null,
      location: values.location || null,
      education: values.education || null,
      experienceYears: values.experienceYears === "" ? null : Number(values.experienceYears),
      expectedSalary: values.expectedSalary === "" ? null : Number(values.expectedSalary),
      resumeUrl: values.resumeUrl || null,
    };
    updateMutation.mutate({ data }, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      },
      onError: () => { toast.error("Failed to update profile."); },
    });
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1">{user?.email}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile Details</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="+1 (555) 000-0000" {...field} /></FormControl>
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
              </div>

              <FormField control={form.control} name="education" render={({ field }) => (
                <FormItem>
                  <FormLabel>Education</FormLabel>
                  <FormControl><Textarea placeholder="B.S. Computer Science, Stanford University" {...field} rows={2} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="experienceYears" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl><Input type="number" min="0" placeholder="3" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="expectedSalary" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Salary ($/yr)</FormLabel>
                    <FormControl><Input type="number" min="0" placeholder="80000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div>
                <FormLabel>Skills</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2 mb-2 min-h-[2rem]">
                  {skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="gap-1.5 pr-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-destructive transition-colors">
                        <X className="h-3 w-3" />
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

              <FormField control={form.control} name="resumeUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume URL</FormLabel>
                  <FormControl><Input placeholder="https://drive.google.com/..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
