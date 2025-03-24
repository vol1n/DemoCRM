import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Zod schema
export const newMeetingSchema = z.object({
  title: z.string(),
  time: z.date(),
});

export function AddMeeting({
  save,
}: {
  save: (meeting: { title: string; time: Date }) => Promise<void>;
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("12:00");

  const form = useForm<z.infer<typeof newMeetingSchema>>({
    resolver: zodResolver(newMeetingSchema),
    defaultValues: {
      title: "",
      time: new Date(),
    },
  });

  const combineDateAndTime = (d: Date | undefined, t: string): Date | null => {
    if (!d || !t) return null;
    const [hours, minutes] = t.split(":").map(Number);
    const fullDate = new Date(d);
    fullDate.setHours(hours!);
    fullDate.setMinutes(minutes!);
    fullDate.setSeconds(0);
    fullDate.setMilliseconds(0);
    return fullDate;
  };

  return (
    <DialogContent>
      <DialogHeader className="mt-4">
        <DialogTitle>Set up meeting</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            const finalDate = combineDateAndTime(date, time);
            if (finalDate) {
              await save({
                ...values,
                time: finalDate,
              });
            }
          })}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Coffee meeting" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem className="flex flex-col">
            <FormLabel>Meeting Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date ?? undefined}
                  onSelect={setDate}
                  disabled={(d) => d < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>

          {/* Time Picker */}
          <FormItem>
            <FormLabel>Meeting Time</FormLabel>
            <FormControl>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <Button type="submit">Add Meeting</Button>
        </form>
      </Form>
    </DialogContent>
  );
}
