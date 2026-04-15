import LoginForm from "./LoginForm";
import { login, sendPasswordReset, updatePassword } from "./actions";

export default function LoginPage() {
  return (
    <LoginForm
      loginAction={login}
      sendPasswordResetAction={sendPasswordReset}
      updatePasswordAction={updatePassword}
    />
  );
}