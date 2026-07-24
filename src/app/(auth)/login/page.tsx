import { AuthForm } from "@/components/auth/auth-form";
import { login } from "@/server/actions/auth";

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
