import type { Meeting } from "@/types/db";
import Link from "next/link";

export function MeetingItem({
  meeting,
  keyNum,
}: {
  meeting: Meeting;
  keyNum: number;
}) {
  return (
    <Link key={keyNum} href={`/dashboard/clients?client=${meeting.clientId}`}>
      <div className="flex w-full items-start justify-between gap-4 rounded-md border p-4 shadow-sm">
        <div className="flex flex-1 flex-col space-y-1">
          <span className="text-sm font-semibold">{meeting.title}</span>
          <span className="text-sm font-semibold">
            {meeting.client.firstName + " " + meeting.client.lastName}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(meeting.time).toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function MeetingView({ meetings }: { meetings: Meeting[] }) {
  return (
    <div className="flex flex-col gap-y-2">
      {meetings.map((m, i) => (
        <MeetingItem meeting={m} keyNum={i} />
      ))}
    </div>
  );
}
