import { api } from "@/trpc/server";
import React from "react";
import { NextTasks } from "./NextTasks";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { UpcomingMeetings } from "./UpcomingMeetings";
import { GenerateTodayPlan } from "./GenerateTodayPlan";

async function DashboardHome() {
  void api.clients.getAll.prefetch();
  void api.company.getAll.prefetch();

  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mr-12 flex w-full flex-col">
      <h1 className="mb-4 text-xl">Home</h1>
      <div className="mb-6 w-full">
        <div className="rounded-md border p-4 shadow-sm">
          <h1 className="text-4xl">Welcome back!</h1>
          <h2 className="text-2xl text-gray-700">
            It is {new Date(Date.now()).toLocaleTimeString()}
          </h2>
        </div>
      </div>
      <div className="w-full items-center text-center">
        <GenerateTodayPlan />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="w-full">
          <h2 className="mb-2 text-lg font-semibold">Upcoming Tasks</h2>
          <NextTasks />
        </div>
        <div className="w-full">
          <h2 className="mb-2 text-lg font-semibold">Upcoming Meetings</h2>
          <UpcomingMeetings />
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
