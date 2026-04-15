import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { login, sendPasswordReset, updatePassword } from "./actions";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm
        loginAction={login}
        sendPasswordResetAction={sendPasswordReset}
        updatePasswordAction={updatePassword}
      />
    </Suspense>
  );
}