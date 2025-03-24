"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { api } from "@/trpc/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
};

const toAddSchema = z.object({
  id: z.string().min(1),
});

function EditClientModal({
  available,
  add,
}: {
  available: {
    firstName: string;
    lastName: string;
    id: string;
  }[];
  add: (formData: z.infer<typeof toAddSchema>) => Promise<void>;
}) {
  const form = useForm<z.infer<typeof toAddSchema>>({
    resolver: zodResolver(toAddSchema),
    defaultValues: {
      id: undefined,
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Client</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(add)} className="space-y-8">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client to add to this company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {available.map((c, i) => (
                      <SelectItem value={c.id} key={i}>
                        {c.firstName} {c.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Add</Button>
        </form>
      </Form>
    </DialogContent>
  );
}

export function ClientView({
  data,
  addClient,
}: {
  data: Client[];
  addClient: (client: { id: string }) => Promise<void>;
}) {
  const [showAddClient, setShowAddClient] = useState(false);
  const { data: available } = api.clients.getAvailable.useQuery();
  return (
    <DialogContent className="flex max-h-[90vh] flex-col">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>Clients</DialogTitle>
          <Button onClick={() => setShowAddClient(true)}>
            <PlusCircle className="h-4 w-4 text-white" />
            Add Client
          </Button>
        </div>
      </DialogHeader>
      <div className="mt-4 grow space-y-4 overflow-y-auto px-1">
        {data.map((client) => (
          <div
            key={client.id}
            className="flex items-center justify-between rounded-md border p-4 shadow-sm"
          >
            <span className="text-sm font-medium">
              {client.firstName} {client.lastName}
            </span>
          </div>
        ))}
      </div>
      <Dialog
        open={showAddClient}
        onOpenChange={(newState) => {
          if (!newState) {
            setShowAddClient(false);
          }
        }}
      >
        {showAddClient && available && (
          <EditClientModal
            available={available}
            add={async (formData) => {
              await addClient(formData);
              setShowAddClient(false);
            }}
          />
        )}
      </Dialog>
    </DialogContent>
  );
}
