import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { createTransport } from "nodemailer";
import { createCallerFactory } from "@/server/api/trpc";
import { appRouter } from "../api/root";
import { db } from "@/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async (params) => {
        console.log("params", params);
        console.log("j", params.provider.server);
        const { identifier, url, provider } = params;
        const { host } = new URL(url);
        const transport = createTransport(provider.server);
        const result = await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Sign in to ${host}`,
          text: `Use ${url} to sign in to DemoCRM`,
        });
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(
            `Email(s) (${failed.map((i) => JSON.stringify(i)).join(", ")}) could not be sent`,
          );
        }
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  events: {
    async createUser(message) {
      const createCaller = createCallerFactory(appRouter);
      const user = message.user;

      try {
        const caller = createCaller({
          db,
          headers: new Headers(),
          session: {
            user: {
              id: user.id!,
            },
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // fake expiry
          },
        });

        await caller.seed.seedDemo();

        console.log(`✅ Seeded demo data for user: ${user.id}`);
      } catch (err) {
        console.error("❌ Error seeding demo data:", err);
      }
    },
  },
} satisfies NextAuthConfig;
