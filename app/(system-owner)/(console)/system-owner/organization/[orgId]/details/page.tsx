"use client";

import { useParams } from "next/navigation";

import SystemOwnerOrganizationDetailsClient from "@/app/components/system-owner/organization/SystemOwnerOrganizationDetailsClient";

export default function OrganizationDetailsPage() {
  const params = useParams<{ orgId: string }>();
  const orgIdParam = Array.isArray(params?.orgId)
    ? params?.orgId[0]
    : params?.orgId;

  return (
    <SystemOwnerOrganizationDetailsClient organizationId={orgIdParam ?? ""} />
  );
}
