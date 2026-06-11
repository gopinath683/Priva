import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useListCompanies, useCreateCompany, useUpdateCompany, getListCompaniesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "Company name is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export default function RecruiterCompany() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: companies } = useListCompanies({ query: { queryKey: getListCompaniesQueryKey() } });
  const myCompany = companies?.find((c: any) => c.recruiterId === user?.id);

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", website: "", description: "", logo: "" },
  });

  useEffect(() => {
    if (myCompany) {
      form.reset({
        name: myCompany.name,
        website: myCompany.website ?? "",
        description: myCompany.description ?? "",
        logo: myCompany.logo ?? "",
      });
    }
  }, [myCompany]);

  function onSubmit(values: z.infer<typeof schema>) {
    const data: any = {
      name: values.name,
      website: values.website || null,
      description: values.description || null,
      logo: values.logo || null,
    };
    if (myCompany) {
      updateMutation.mutate({ id: myCompany.id, data }, {
        onSuccess: () => {
          toast.success("Company profile updated!");
          queryClient.invalidateQueries({ queryKey: getListCompaniesQueryKey() });
        },
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast.success("Company profile created!");
          queryClient.invalidateQueries({ queryKey: getListCompaniesQueryKey() });
        },
      });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground mt-1">Your company details shown to applicants</p>
      </div>
      <Card>
        <CardHeader><CardTitle>{myCompany ? "Update" : "Create"} Company Profile</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl><Input placeholder="Acme Corp" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="website" render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl><Input placeholder="https://acme.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Tell candidates about your company..." {...field} rows={4} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="logo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl><Input placeholder="https://acme.com/logo.png" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Saving..." : myCompany ? "Update Profile" : "Create Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
