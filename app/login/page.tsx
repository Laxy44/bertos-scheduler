import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { login, sendPasswordReset } from "./actions";

export default async function LoginPage() {
  // Password recovery must land on /auth/callback first (session + cookies), not /reset-password.

  return (
    <Suspense fallback={null}>
      <LoginForm loginAction={login} sendPasswordResetAction={sendPasswordReset} />
    </Suspense>
  );
}