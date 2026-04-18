"use client";

import { useState, useTransition } from "react";

import { updateEmployeeWorkspaceSettingsAction, updateWorkspaceMemberRoleAction } from "@/app/settings/actions";
import type { MemberRow } from "@/app/settings/actions";

type Props = {
  initialShowEmail: boolean;
  initialShowPhone: boolean;
  members: MemberRow[];
};

function accessLabel(role: string) {
  const r = role.toLowerCase();
  if (r === "owner" || r === "admin") return "admin" as const;
  return "staff" as const;
}

export default function EmployeeSettingsForm({
  initialShowEmail,
  initialShowPhone,
  members,
}: Props) {
  const [showEmail, setShowEmail] = useState(initialShowEmail);
  const [showPhone, setShowPhone] = useState(initialShowPhone);
  const [memberMsg, setMemberMsg] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSaveFields(e: React.FormEvent) {
    e.preventDefault();
    setFormMsg(null);
    startTransition(async () => {
      const res = await updateEmployeeWorkspaceSettingsAction({
        showEmailField: showEmail,
        showPhoneField: showPhone,
      });
      setFormMsg(res.ok ? "Saved." : res.error);
    });
  }

  function onRoleChange(userId: string, access: "admin" | "staff") {
    setMemberMsg(null);
    startTransition(async () => {
      const res = await updateWorkspaceMemberRoleAction({ userId, access });
      setMemberMsg(res.ok ? "Role updated." : res.error);
      if (res.ok) window.location.reload();
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Employee form</h2>
        <p className="mt-1 text-sm text-slate-500">
          Every employee has a name, hourly rate, and role in Planyo. Choose optional fields to highlight
          when onboarding staff (stored on the workspace for future forms).
        </p>

        <form onSubmit={onSaveFields} className="mt-5 space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showEmail}
              onChange={(e) => setShowEmail(e.target.checked)}
            />
            <span>Show email field on employee profile</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showPhone}
              onChange={(e) => setShowPhone(e.target.checked)}
            />
            <span>Show phone field on employee profile</span>
          </label>
          {formMsg ? (
            <p
              className={`text-sm ${formMsg === "Saved." ? "text-emerald-700" : "text-red-600"}`}
              role="status"
            >
              {formMsg}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Workspace access</h2>
        <p className="mt-1 text-sm text-slate-500">
          Admins can manage the schedule and settings. Staff use the app day-to-day. The workspace owner
          cannot be changed here.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Person</th>
                <th className="px-3 py-2">Access</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isOwner = m.role.toLowerCase() === "owner";
                const current = accessLabel(m.role);
                return (
                  <tr key={m.userId} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-900">{m.displayName || "Team member"}</div>
                      <div className="text-xs text-slate-400">{m.userId.slice(0, 8)}…</div>
                    </td>
                    <td className="px-3 py-2.5">
                      {isOwner ? (
                        <span className="text-sm text-slate-600">Owner (fixed)</span>
                      ) : (
                        <select
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          value={current}
                          disabled={pending}
                          onChange={(e) =>
                            onRoleChange(m.userId, e.target.value as "admin" | "staff")
                          }
                        >
                          <option value="admin">Admin</option>
                          <option value="staff">Employee</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {memberMsg ? (
          <p className={`mt-2 text-sm ${memberMsg.includes("updated") ? "text-emerald-700" : "text-red-600"}`}>
            {memberMsg}
          </p>
        ) : null}
      </section>
    </div>
  );
}
