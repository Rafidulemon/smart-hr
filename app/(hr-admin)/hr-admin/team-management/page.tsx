import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth/guards";
import { canManageTeams } from "@/types/hr-team";

import TeamManagementClient from "./TeamManagementClient";

export default async function TeamManagementPage() {
  const user = await requireUser();

  if (!canManageTeams(user.role)) {
    redirect("/hr-admin");
  }

  return <TeamManagementClient />;
}
