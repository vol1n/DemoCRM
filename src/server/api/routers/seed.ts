import { faker } from "@faker-js/faker";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const TASK_BANK = [
  {
    title: "Follow up with client",
    description:
      "Send a follow-up email regarding the last meeting discussion.",
  },
  {
    title: "Prepare proposal",
    description: "Draft and review the project proposal for the new client.",
  },
  {
    title: "Team sync meeting",
    description: "Schedule and prepare agenda for internal team sync.",
  },
  {
    title: "Review quarterly report",
    description: "Analyze financial and performance metrics from Q2.",
  },
  {
    title: "Client onboarding",
    description: "Initiate onboarding process for the newly signed client.",
  },
  {
    title: "Update CRM records",
    description:
      "Ensure all client details and notes are updated in the system.",
  },
  {
    title: "Design mockups",
    description: "Create visual mockups for the new landing page.",
  },
  {
    title: "Resolve support tickets",
    description: "Clear the backlog of high-priority customer issues.",
  },
  {
    title: "Finalize marketing assets",
    description: "Finish review and approval of campaign materials.",
  },
  {
    title: "Schedule 1:1 meetings",
    description: "Set up individual check-ins with team members.",
  },
];

export const seedRouter = createTRPCRouter({
  seedDemo: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.session.user;
    const name = faker.company.name();
    const slug = name
      .replace(/[^a-zA-Z0-9 ]/g, "") // remove non-alphanumerics except space
      .trim()
      .replace(/\s+/g, "_") // spaces → underscores
      .toLowerCase();

    const email = `contact@${slug}.com`;

    const company = await ctx.db.company.create({
      data: {
        name: name,
        email: email,
        userId: user.id,
      },
    });

    const clients = await Promise.all(
      Array.from({ length: 2 }).map(() => {
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const email =
          firstName.toLowerCase() +
          "_" +
          lastName.toLowerCase() +
          faker.number.int({ min: 10, max: 100 }).toString() +
          "@" +
          faker.internet.domainName();
        return ctx.db.client.create({
          data: {
            firstName,
            lastName,
            email,
            companyId: company.id,
            userId: user.id,
          },
        });
      }),
    );

    await Promise.all(
      Array.from({ length: faker.number.int({ min: 2, max: 3 }) }).map(() => {
        const task = faker.helpers.arrayElement(TASK_BANK);
        return ctx.db.task.create({
          data: {
            title: task.title,
            description: task.description,
            dueDate: faker.date.soon({ days: 10 }),
            companyId: company.id,
          },
        });
      }),
    );

    for (const client of clients) {
      await Promise.all(
        Array.from({ length: faker.number.int({ min: 2, max: 3 }) }).map(() => {
          const task = faker.helpers.arrayElement(TASK_BANK);
          return ctx.db.task.create({
            data: {
              title: task.title,
              description: task.description,
              dueDate: faker.date.soon({ days: 10 }),
              clientId: client.id,
              companyId: company.id,
            },
          });
        }),
      );
    }

    for (const client of clients) {
      await Promise.all(
        Array.from({ length: faker.number.int({ min: 1, max: 2 }) }).map(() =>
          ctx.db.meeting.create({
            data: {
              title: `Meeting with ${client.firstName}`,
              time: faker.date.soon({ days: 15 }),
              clientId: client.id,
            },
          }),
        ),
      );
    }

    return { success: true, message: "Seeded demo data for current user." };
  }),
});
