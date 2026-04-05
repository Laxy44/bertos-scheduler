import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Login</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to access the scheduler
        </p>

        <form className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Your password"
            />
          </div>

          <div className="flex gap-3">
            <button
              formAction={login}
              className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Login
            </button>

            <button
              formAction={signup}
              className="flex-1 rounded-2xl bg-white px-4 py-3 font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}