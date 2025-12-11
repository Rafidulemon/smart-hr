"use client";

import { useParams } from "next/navigation";

import SystemOwnerOrganizationEditClient from "@/app/components/system-owner/organization/SystemOwnerOrganizationEditClient";

export default function OrganizationEditPage() {
  const params = useParams<{ orgId: string }>();
  const orgIdParam = Array.isArray(params?.orgId)
    ? params?.orgId[0]
    : params?.orgId;

  return (
    <SystemOwnerOrganizationEditClient organizationId={orgIdParam ?? ""} />
  );
}
