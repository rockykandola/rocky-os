import { AuthForm } from "@/components/auth/auth-form";
import { signup } from "@/server/actions/auth";

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
