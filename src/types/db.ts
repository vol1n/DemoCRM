import type { Prisma } from "@prisma/client";

export type Client = Prisma.ClientGetPayload<{
  include: {
    company: true;
  };
}>;

export type Company = Prisma.CompanyGetPayload<object>;

export type Task = Prisma.TaskGetPayload<object>;

export type Meeting = Prisma.MeetingGetPayload<{
  include: {
    client: true;
  };
}>;
