import React, { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";

const emailFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body cannot be empty"),
});

type PromptEmailModalProps = {
  onCancel: () => void;
  onSubmit: (prompt: string) => void;
  loading: boolean;
};

export function PromptEmailModal({
  onCancel,
  onSubmit,
  loading,
}: PromptEmailModalProps) {
  const [prompt, setPrompt] = useState("");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Generate Email with AI</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <Input
          placeholder="e.g. Follow-up on project deadline"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(prompt)}
            disabled={loading || prompt.trim().length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

export function EditEmailModal({
  clientId,
  companyId,
  onSend,
}: {
  clientId: string | undefined;
  companyId: string | undefined;
  onSend: (data: z.infer<typeof emailFormSchema>) => void;
}) {
  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      subject: "",
      body: "",
    },
  });

  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const { mutateAsync: generateEmail, status } =
    api.ai.generateEmail.useMutation();

  const generating = useMemo(() => {
    return status === "pending";
  }, [status]);

  const handlePromptSubmit = async (prompt: string) => {
    try {
      const { body, subject } = await generateEmail({
        userPrompt: prompt,
        companyId,
        clientId,
      });
      form.setValue("subject", subject);
      form.setValue("body", body);
      setPromptModalOpen(false);
    } catch (err) {
      console.error("Failed to generate email:", err);
    }
  };

  return (
    <>
      <Dialog open={promptModalOpen} onOpenChange={setPromptModalOpen}>
        {promptModalOpen && (
          <PromptEmailModal
            onCancel={() => setPromptModalOpen(false)}
            onSubmit={handlePromptSubmit}
            loading={generating}
          />
        )}
      </Dialog>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Email</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSend)} className="space-y-6">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Follow up on..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={8}
                      placeholder="Write the email..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <Button type="submit">Send</Button>
              <Button
                type="button"
                onClick={() => setPromptModalOpen(true)}
                variant="outline"
              >
                <Badge className="mr-2 bg-blue-600 hover:bg-blue-400">
                  AI ✨
                </Badge>
                Generate Email
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </>
  );
}
