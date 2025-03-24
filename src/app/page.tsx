import Link from "next/link";

import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";

export default async function HeroSection() {
  const session = await auth();

  return (
    <HydrateClient>
      <section className="h-screen w-full bg-gradient-to-b from-white to-gray-500 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Your simple CRM demo
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Manage clients, tasks, and meetings — all in one place.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-white shadow-sm transition hover:bg-blue-500"
              >
                Dashboard →
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-white shadow-sm transition hover:bg-blue-500"
              >
                Get Started
              </Link>
            )}
            <Link
              href="https://github.com/vol1n/DemoCRM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 transition hover:bg-gray-100"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </section>
    </HydrateClient>
  );
}
