import React from "react";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { redirect } from "next/navigation";
import CompanyTable from "./CompanyTable";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function Companies({ searchParams }: Props) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  void api.company.getAll.prefetch();

  return (
    <HydrateClient>
      <div className="mr-12 flex w-full flex-col">
        <CompanyTable initialOpen={params?.company ?? null} />
      </div>
    </HydrateClient>
  );
}

export default Companies;
