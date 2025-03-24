import { taskRouter } from "@/server/api/routers/task";
import { clientRouter } from "@/server/api/routers/client";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { companyRouter } from "@/server/api/routers/company";
import { meetingRouter } from "@/server/api/routers/meeting";
import { seedRouter } from "./routers/seed";
import { aiRouter } from "./routers/ai";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  task: taskRouter,
  clients: clientRouter,
  company: companyRouter,
  meeting: meetingRouter,
  seed: seedRouter,
  ai: aiRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
