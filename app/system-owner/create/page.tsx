import CreateOrganizationForm from "@/app/components/organization/CreateOrganizationForm";

export default async function SystemOwnerCreatePage() {
  return (
    <CreateOrganizationForm
      returnHref="/system-owner"
      returnLabel="Back to System Owner console"
    />
  );
}
