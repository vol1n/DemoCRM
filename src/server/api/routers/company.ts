import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const companyRouter = createTRPCRouter({
  getSelectCompanies: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.company.findMany({
      select: {
        id: true,
        name: true,
      },
      where: {
        createdBy: { id: ctx.session.user.id },
      },
    });
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.company.findMany({
      include: {
        tasks: true,
        clients: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      where: {
        createdBy: { id: ctx.session.user.id },
      },
    });
  }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.client.delete({
          where: {
            id: input.id,
            createdBy: { id: ctx.session.user.id },
          },
        });
      } catch {
        return null;
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.company.create({
        data: {
          createdBy: { connect: { id: ctx.session.user.id } },
          name: input.name,
          email: input.email,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        email: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.company.update({
        where: {
          id: input.id,
          createdBy: { id: ctx.session.user.id },
        },
        data: {
          name: input.name,
          email: input.email,
        },
      });
    }),

  addClientTo: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        clientId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.company.update({
        where: { id: input.id },
        data: {
          clients: { connect: { id: input.clientId } },
        },
      });
    }),

  sendEmail: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        subject: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sendTo = await ctx.db.company.findFirst({
        where: {
          createdBy: {
            id: ctx.session.user.id,
          },
          id: input.id,
        },
      });
      if (!sendTo) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "company does not exist",
        });
      }
      const address = sendTo.email;
      await resend.emails.send({
        from: "democrm@vol1n.dev",
        to: address,
        subject: input.subject,
        text: input.body,
      });
    }),
});
