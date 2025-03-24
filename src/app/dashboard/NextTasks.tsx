"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/trpc/react";
import type { Task } from "@/types/db";
import Link from "next/link";
import React from "react";

function TaskItem({ task, keyNum }: { task: Task; keyNum: number }) {
  return (
    <Link
      key={keyNum}
      href={
        task.clientId
          ? `/dashboard/clients?client=${task.clientId}`
          : `/dashboard/companies?company=${task.companyId}`
      }
    >
      <div className="flex w-full items-start justify-between gap-4 rounded-md border p-4 shadow-sm">
        <div className="pt-1">
          <Checkbox checked={false} disabled={true} />
        </div>
        <div className="flex flex-1 flex-col space-y-1">
          <span className="text-sm font-semibold">{task.title}</span>
          <span className="text-sm text-muted-foreground">
            {task.description}
          </span>
          {task.dueDate && (
            <span className="text-xs text-gray-500">
              {task.dueDate.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function NextTasks() {
  const { data, isLoading, isError } = api.task.getUpcoming.useQuery();
  return (
    <div className="h-full w-full border-gray-600">
      <div className="flex w-full flex-col gap-y-2">
        {(() => {
          if (isLoading) return <span>Loading...</span>;
          if (isError) return <span>Error fetching upcoming tasks</span>;
          if (data) return data.map((t, i) => TaskItem({ task: t, keyNum: i }));
        })()}
      </div>
    </div>
  );
}
