import React from "react";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { redirect } from "next/navigation";
import ClientTable from "./ClientTable";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function Clients({ searchParams }: Props) {
  const params = await searchParams;
  const session = await auth();
  console.log(session?.user);
  if (!session?.user) {
    redirect("/login");
  }
  void api.clients.getAll.prefetch();
  void api.company.getSelectCompanies.prefetch();

  return (
    <HydrateClient>
      <div className="mr-12 flex w-full flex-col">
        <ClientTable initialOpen={params?.client ?? null} />
      </div>
    </HydrateClient>
  );
}

export default Clients;
