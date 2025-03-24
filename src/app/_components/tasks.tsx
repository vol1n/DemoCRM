"use client";
import React, { useState } from "react";
import type { Task } from "@/types/db";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import DeleteModal from "./DeleteModal";

export const taskFormSchema = z.array(
  z.object({
    id: z.string(),
    complete: z.boolean(),
  }),
);

export const newTaskFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  dueDate: z.date().nullable(),
});

function EditTaskModal({
  data,
  save,
}: {
  data: {
    title: string;
    description: string | null;
    dueDate: Date | null;
  } | null;
  save: (task: {
    title: string;
    description: string;
    dueDate: Date | null;
  }) => Promise<void>;
}) {
  const form = useForm<z.infer<typeof newTaskFormSchema>>({
    resolver: zodResolver(newTaskFormSchema),
    defaultValues: {
      title: data?.title ?? "",
      description: data?.description ?? "",
      dueDate: data?.dueDate ?? null,
    },
  });
  return (
    <DialogContent>
      <DialogHeader className="mt-4">
        <DialogTitle>New Tasks</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(save)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task</FormLabel>
                <FormControl>
                  <Input placeholder="Plan coffee meeting" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Schedule a meeting for coffee at Starbucks"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Add Task</Button>
        </form>
      </Form>
    </DialogContent>
  );
}

function TaskView({
  data,
  update,
  addTask,
  updateTask,
  deleteTask,
}: {
  data: Task[];
  update: (changes: { id: string; complete: boolean }[]) => Promise<void>;
  addTask: (newTask: {
    title: string;
    description: string;
    dueDate: Date | null;
  }) => Promise<void>;
  updateTask: (
    id: string,
    task: { title: string; description: string; dueDate: Date | null },
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}) {
  const [newTask, setNewTask] = useState<boolean>(false);
  const [editTaskTarget, setEditTaskTarget] = useState<string | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<string | null>(null);
  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: data.map((t) => ({
      id: t.id,
      complete: !!t.completedTime,
    })),
  });
  return (
    <DialogContent className="flex max-h-[90vh] flex-col">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>Tasks</DialogTitle>
          <Dialog
            open={newTask}
            onOpenChange={(newState) => {
              if (!newState) {
                setNewTask(false);
              }
            }}
          >
            {newTask && (
              <EditTaskModal
                data={null}
                save={async (task) => {
                  await addTask(task);
                  setNewTask(false);
                }}
              />
            )}
          </Dialog>
          <Dialog
            open={Boolean(editTaskTarget)}
            onOpenChange={(newState) => {
              if (!newState) {
                setEditTaskTarget(null);
              }
            }}
          >
            {editTaskTarget && (
              <EditTaskModal
                data={data.find((task) => task.id == editTaskTarget) ?? null}
                save={async (task) => {
                  await updateTask(editTaskTarget, task);
                  setEditTaskTarget(null);
                }}
              />
            )}
          </Dialog>
          <Dialog
            open={Boolean(deleteTaskTarget)}
            onOpenChange={(newState) => {
              if (!newState) {
                setDeleteTaskTarget(null);
              }
            }}
          >
            {deleteTaskTarget && (
              <DeleteModal
                deleteFn={async () => {
                  await deleteTask(deleteTaskTarget);
                  setDeleteTaskTarget(null);
                }}
              />
            )}
          </Dialog>
          <Button onClick={() => setNewTask(true)}>
            <PlusCircle className="h-4 w-4 text-white" />
            Add Task
          </Button>
        </div>
      </DialogHeader>
      <div className="mt-4 grow space-y-8 overflow-y-auto px-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(update)} className="space-y-8">
            {data.map((t, i) => (
              <FormField
                key={i}
                control={form.control}
                name={`${i}.complete`}
                render={({ field }) => (
                  <FormItem className="flex items-start justify-between gap-4 rounded-md border p-4 shadow-sm">
                    {/* Checkbox on the left */}
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>

                    {/* Task content stacked */}
                    <div className="flex flex-1 flex-col space-y-1">
                      <FormLabel className="text-sm font-semibold">
                        {t.title}
                      </FormLabel>
                      <FormDescription className="text-sm text-muted-foreground">
                        {t.description}
                      </FormDescription>
                      {t.dueDate && (
                        <span className="text-xs text-gray-500">
                          {t.dueDate.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Optional buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => setEditTaskTarget(t.id)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => setDeleteTaskTarget(t.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </DialogContent>
  );
}

export default TaskView;
