"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";

export function GenerateTodayPlan() {
  const [showResult, setShowResult] = useState(false);
  const [triggered, setTriggered] = useState(false);

  const { data, isFetching, refetch } = api.ai.dailyPlan.useQuery(undefined, {
    enabled: false, // only run when manually triggered
  });

  async function handleGenerate() {
    setTriggered(true);
    setShowResult(false);
    await refetch();
    setShowResult(true);
  }

  if (showResult && data) {
    return (
      <textarea
        readOnly
        className="w-[30rem] rounded-md border border-gray-300 bg-gray-50 p-2 text-sm text-gray-700 shadow-sm"
        rows={5}
        value={data}
      />
    );
  }

  return (
    <Button
      className="w-60"
      onClick={handleGenerate}
      disabled={isFetching || triggered}
      variant="outline"
    >
      {isFetching ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Thinking...
        </>
      ) : (
        <>
          <Badge className="bg-blue-600 hover:bg-blue-400">AI ✨</Badge>
          Get Today&lsquo;s Plan
        </>
      )}
    </Button>
  );
}
