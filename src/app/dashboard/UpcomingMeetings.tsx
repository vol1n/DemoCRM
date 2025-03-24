'use client';

import { api } from '@/trpc/react';
import React from 'react';
import { MeetingView } from '../_components/meetings';

export function UpcomingMeetings() {
  const { data: meetings, isLoading, isError } = api.meeting.upcoming.useQuery();

  if (isLoading || !meetings) return <span>Loading...</span>;
  if (isError) return <span>Error fetching meetings</span>
  return <MeetingView meetings={meetings} />
}
