import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const meetingRouter = createTRPCRouter({
  upcoming: protectedProcedure
  .query(async ({ ctx }) => {
    return await ctx.db.meeting.findMany({
      take: 5,
      include: {
        client: true
      },
      orderBy: {
        time: "asc", // ascending so the soonest upcoming meetings are first
      },
      where: {
        client: {
          createdBy: {
            id: ctx.session.user.id,
          },
        },
        time: {
          gt: new Date(), // only meetings after the current time
        },
      },
    });
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      time: z.date(),
      clientId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.meeting.create({
        data: {
          title: input.title,
          time: input.time,
          client: { connect: { id: input.clientId}}
        }
      });
    }),

  upcomingClient: protectedProcedure
    .input(z.object({
      clientId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findMany({
        take: 5,
        include: {
          client: true
        },
        orderBy: {
          time: "asc", // ascending so the soonest upcoming meetings are first
        },
        where: {
          client: {
            createdBy: {
              id: ctx.session.user.id,
            },
            id: input.clientId
          },
          time: {
            gt: new Date(), // only meetings after the current time
          },
        },
      });
    })
})
