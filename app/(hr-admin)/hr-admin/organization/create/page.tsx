import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth/guards";

import CreateOrganizationClient from "./CreateOrganizationClient";

export default async function CreateOrganizationPage() {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") {
    redirect("/hr-admin/organization");
  }
  return <CreateOrganizationClient />;
}
