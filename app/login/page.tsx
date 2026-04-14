import LoginForm from "./LoginForm";
import { login, signup, sendPasswordReset, updatePassword } from "./actions";

export default function LoginPage() {
  return (
    <LoginForm
      loginAction={login}
      signupAction={signup}
      sendPasswordResetAction={sendPasswordReset}
      updatePasswordAction={updatePassword}
    />
  );
}