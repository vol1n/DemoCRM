import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const taskRouter = createTRPCRouter({

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      dueDate: z.date().nullable(),
      description: z.string().min(1),
      companyId: z.string().min(1).optional(),
      clientId: z.string().min(1).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.create({
        data: {
          title: input.title,
          dueDate: input.dueDate,
          description: input.description,
          ...(input.companyId && {
            company: {
              connect: { id: input.companyId }
            }
          }),
          ...(input.clientId && {
            client: {
              connect: { id: input.clientId }
            }
          })
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.task.delete({
        where: {
          id: input.id,
          OR: [
            {
              client: { userId: ctx.session.user.id }
            },
            {
              company: { userId: ctx.session.user.id }
            }
          ],
        }
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      dueDate: z.date().nullable(),
      description: z.string().min(1),
      companyId: z.string().min(1).optional(),
      clientId: z.string().min(1).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        where: { id: input.id },
        data: {
          title: input.title,
          dueDate: input.dueDate,
          description: input.description,
          ...(input.companyId && {
            company: {
              connect: { id: input.companyId }
            }
          }),
          ...(input.clientId && {
            client: {
              connect: { id: input.clientId }
            }
          })
        },
      });
    }),

  getUpcoming: protectedProcedure
    .query(async ({ ctx }) => {
      const post = await ctx.db.task.findMany({
        orderBy: [
          { dueDate: "asc" },
          { dateAdded: "desc" }
        ],
        where: {
          OR: [
            {
              client: { userId: ctx.session.user.id }
            },
            {
              company: { userId: ctx.session.user.id }
            }
          ],
          completedTime: null
        },
        take: 5
      });

      return post ?? null;
    }),

  getCompanyTasks: protectedProcedure
    .input(z.object({
      id: z.string().min(1)
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.task.findMany({
        orderBy: { dueDate: "desc", dateAdded: "desc" },
        where: {
          company: {
            createdBy: {
              id: ctx.session.user.id
            },
            id: input.id
          }
        }
      })
    }),

  getClientTasks: protectedProcedure
    .input(z.object({
      id: z.string().min(1)
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.task.findMany({
       orderBy: { dueDate: "desc", dateAdded: "desc" },
        where: {
          client: {
            createdBy: {
              id: ctx.session.user.id,
            },
            id: input.id
          }
        }
      })
    }),

  updateCompletion: protectedProcedure
    .input(z.object({
      id: z.string().min(1),
      complete: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.task.update({
        where: {
          id: input.id,
          OR: [
            {
              client: { userId: ctx.session.user.id }
            },
            {
              company: { userId: ctx.session.user.id }
            }
          ]
        },
        data: {
          completedTime: input.complete ? new Date(Date.now()) : null
        }
      })
    }),

  updateCompletions: protectedProcedure
    .input(z.array(z.object({
      id: z.string().min(1),
      complete: z.boolean()
    })))
    .mutation(async ({ ctx, input }) => {
      return await Promise.all(
        input.map((t) => {
          return ctx.db.task.updateMany({
            where: {
              id: t.id,
              OR: [
                {
                  client: { userId: ctx.session.user.id }
                },
                {
                  company: { userId: ctx.session.user.id }
                }
              ]
            },
            data: {
              completedTime: t.complete ? new Date(Date.now()) : null
            }
          });
        })
      );
    }),
});
