import UpdatePasswordForm from "@/features/auth/components/UpdatePasswordForm";

interface UpdatePasswordPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const params = await searchParams;

  return <UpdatePasswordForm initialLinkError={params.error === "invalid-link"} />;
}
