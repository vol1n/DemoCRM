"use client";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import type { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";

export const companyFormSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().min(1).email(),
});

function NewCompanyModal({
  createCompany,
}: {
  createCompany: (formData: z.infer<typeof companyFormSchema>) => Promise<void>;
}) {
  const form = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  const { toast } = useToast();
  const submitFn = async (formData: z.infer<typeof companyFormSchema>) => {
    try {
      await createCompany(formData);
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
        <DialogTitle>New Company</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitFn)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="ACME, Inc." {...field} />
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
                  <Input placeholder="help@acme.com" {...field} />
                </FormControl>
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

export default NewCompanyModal;
