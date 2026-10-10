import LoginForm from "@/features/auth/components/LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ passwordUpdated?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return <LoginForm passwordUpdated={params.passwordUpdated === "1"} />;
}