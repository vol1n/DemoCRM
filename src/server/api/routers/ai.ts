import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";
const client = new OpenAI();
import { z } from "zod";

export const aiRouter = createTRPCRouter({
  dailyPlan: protectedProcedure.query(async ({ ctx }) => {
    const userTasks = await ctx.db.task.findMany({
      orderBy: { dueDate: "asc" },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      where: {
        OR: [
          {
            client: { userId: ctx.session.user.id },
          },
          {
            company: { userId: ctx.session.user.id },
          },
        ],
      },
      take: 6,
    });
    const userMeetings = await ctx.db.meeting.findMany({
      orderBy: { time: "asc" },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      where: {
        client: { createdBy: { id: ctx.session.user.id } },
      },
      take: 3,
    });
    const devPrompt = `Write a daily plan for the user given the following tasks are coming up. The user is not interfacing directly with you, just give them a daily plan.
    We don't want fluff; we want a direct plan to help the user get the necessary work done today. Be direct, concise, and still helpful and detailed.
    Don't talk about the data as it appears in the database, talk about it to the user in a simple, plain English, system-agnostic sort of way.
    You do not need to include every tasks or meetings in your response - just the most pressing ones.
    Don't say stuff like "for the task labeled "Complete write-up", do x", instead say "work on your write up, I recommend: (your recommendations)"
          Focus on tasks in the order they are due. If they have no due date, the user can work on them after the user works on the tasks with a clear deadline. Give them a reasonable amount of work for the day.
          For meetings, if one is coming up soon you could add some time for planning for it.
          Here are the tasks:
${JSON.stringify(userTasks.map((t) => JSON.stringify(t)))}
Here are the user's meetings as well:
${JSON.stringify(userMeetings.map((m) => JSON.stringify(m)))}`;
    console.log("proompting", devPrompt);
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: devPrompt,
        },
      ],
    });
    return completion.choices[0]?.message.content;
  }),

  generateEmail: protectedProcedure
    .input(
      z.object({
        userPrompt: z.string(),
        clientId: z.string().optional(),
        companyId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.clientId && !input.companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Need either a client or company id",
        });
      }
      const isClient = !!input.clientId;
      const receiverInfo = JSON.stringify(
        isClient
          ? await ctx.db.client.findFirst({
              where: {
                id: input.clientId!,
                createdBy: { id: ctx.session.user.id },
              },
            })
          : await ctx.db.company.findFirst({
              where: {
                id: input.companyId,
                createdBy: { id: ctx.session.user.id },
              },
            }),
      );
      const devPrompt = `
            You are an assistant within a CRM, with the task of generating emails.
            The user has requested an email generated to the ${isClient ? "Client" : "Company"} with the following information:
 ${receiverInfo}. Remember you are responding specifically to the  ${isClient ? "Client, even if they are with a company" : "Company"}.
 The user's prompt will be given below. Respond in JSON format, { subject: {your subject}, body: {your email body} }`;
      console.log("devPrompt", devPrompt);
      const response = await client.responses.create({
        model: "gpt-4o",
        text: {
          format: {
            type: "json_schema",
            name: "email",
            schema: {
              type: "object",
              properties: {
                subject: {
                  type: "string",
                },
                body: {
                  type: "string",
                },
              },
              additionalProperties: false,
              required: ["subject", "body"],
            },
            strict: true,
          },
        },
        input: [
          {
            role: "developer",
            content: devPrompt,
          },
          {
            role: "user",
            content: input.userPrompt,
          },
        ],
      });
      const schema = z.object({
        subject: z.string().min(1),
        body: z.string().min(1),
      });
      return schema.parse(JSON.parse(response.output_text));
    }),
});
