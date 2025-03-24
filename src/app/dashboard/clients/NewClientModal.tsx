"use client";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";
import type { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";

export const clientFormSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().min(1).email(),
  companyId: z.string().nullable(),
});

function NewClientModal({
  createClient,
}: {
  createClient: (formData: z.infer<typeof clientFormSchema>) => Promise<void>;
}) {
  const form = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      companyId: null,
    },
  });
  const { toast } = useToast();
  const {
    data: selectOptions,
    isLoading,
    isError,
  } = api.company.getSelectCompanies.useQuery();
  const submitFn = async (formData: z.infer<typeof clientFormSchema>) => {
    try {
      await createClient(formData);
      toast({
        title: "Success",
        description: "Client created",
      });
    } catch (error) {
      const err = error as TRPCClientError<AppRouter>;

      if (err.message.includes("Email is already in use")) {
        form.setError("email", {
          type: "manual",
          message: "This email is already taken.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Something went wrong.",
        });
      }
    }
  };
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New Client</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitFn)} className="space-y-8">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(() => {
                      if (isLoading)
                        return (
                          <span className="text-gray-600">Loading...</span>
                        );
                      if (isError)
                        return (
                          <span className="text-gray-600">
                            Failed to fetch companies
                          </span>
                        );
                      if (selectOptions)
                        return selectOptions.map((company, i) => (
                          <SelectItem key={i} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ));
                    })()}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </DialogContent>
  );
}

export default NewClientModal;
