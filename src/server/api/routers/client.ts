import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const clientRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().min(1),
        companyId: z.string().min(1).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.client.create({
          data: {
            createdBy: { connect: { id: ctx.session.user.id } },
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            ...(input.companyId && {
              company: {
                connect: { id: input.companyId },
              },
            }),
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002" && // Unique constraint
          (err.meta?.target as string[]).includes("email")
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email is already in use.",
          });
        }

        throw err; // rethrow anything else
      }
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

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const clients = await ctx.db.client.findMany({
      include: {
        company: true,
        tasks: true,
        meetings: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { dateAdded: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
    return clients ?? [];
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        companyId: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.client.update({
          where: {
            id: input.id,
            createdBy: { id: ctx.session.user.id },
          },
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            companyId: input.companyId,
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002" && // Unique constraint
          (err.meta?.target as string[]).includes("email")
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email is already in use.",
          });
        }

        throw err; // rethrow anything else
      }
    }),

  getAvailable: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.client.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      where: {
        createdBy: { id: ctx.session.user.id },
        company: null,
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
      const sendTo = await ctx.db.client.findFirst({
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
          message: "client does not exist",
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
