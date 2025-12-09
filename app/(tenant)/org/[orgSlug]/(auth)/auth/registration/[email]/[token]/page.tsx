import { redirect } from "next/navigation";

import { tenantAuthPath } from "@/lib/tenant/routing";

type Props = {
  params: { orgSlug: string; email: string; token: string };
};

export default function RegistrationTokenPage({ params }: Props) {
  const searchParams = new URLSearchParams({ token: params.token });
  redirect(
    tenantAuthPath(params.orgSlug, `/signup?${searchParams.toString()}`),
  );
}
