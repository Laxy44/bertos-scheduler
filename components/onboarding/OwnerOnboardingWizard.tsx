"use client";

import { useActionState, useMemo, useState } from "react";
import StepAccount from "./steps/StepAccount";
import StepBusiness from "./steps/StepBusiness";
import StepTeam from "./steps/StepTeam";

type ActionState = {
  error: string | null;
};

type TeamEmployee = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type OwnerOnboardingWizardProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initialMessage?: string;
  isLoggedInWithoutMembership: boolean;
  existingUserEmail: string;
};

const STEPS = ["Your account", "Your business", "Your team"] as const;
const INITIAL_ACTION_STATE: ActionState = { error: null };

const INITIAL_EMPLOYEE: TeamEmployee = {
  firstName: "",
  lastName: "",
  email: "",
  role: "Service",
};

export default function OwnerOnboardingWizard({
  action,
  initialMessage,
  isLoggedInWithoutMembership,
  existingUserEmail,
}: OwnerOnboardingWizardProps) {
  const [account, setAccount] = useState({
    firstName: "",
    lastName: "",
    email: existingUserEmail,
    password: "",
  });
  const [business, setBusiness] = useState({
    companyName: "",
    country: "",
    businessType: "",
    employeeCount: "",
  });
  const [team, setTeam] = useState({
    roles: ["Service", "Kitchen"],
    customRole: "",
    employees: [{ ...INITIAL_EMPLOYEE }],
    sendInvites: false,
  });
  const [step, setStep] = useState(0);
  const [localError, setLocalError] = useState<string | null>(initialMessage || null);

  const [state, formAction, pending] = useActionState(action, INITIAL_ACTION_STATE);

  const serializedRoles = useMemo(() => JSON.stringify(team.roles), [team.roles]);
  const serializedEmployees = useMemo(() => JSON.stringify(team.employees), [team.employees]);

  function validateCurrentStep() {
    if (step === 0) {
      if (!account.firstName.trim() || !account.lastName.trim()) {
        setLocalError("Please enter first name and last name.");
        return false;
      }
      if (!isLoggedInWithoutMembership) {
        if (!account.email.trim()) {
          setLocalError("Please enter your email.");
          return false;
        }
        if (account.password.length < 6) {
          setLocalError("Password must be at least 6 characters.");
          return false;
        }
      }
    }

    if (step === 1) {
      if (!business.companyName.trim()) {
        setLocalError("Please enter your company name.");
        return false;
      }
      if (!business.country) {
        setLocalError("Please select a country.");
        return false;
      }
      if (!business.businessType) {
        setLocalError("Please select a business type.");
        return false;
      }
      if (!business.employeeCount) {
        setLocalError("Please select employee count.");
        return false;
      }
    }

    if (step === 2) {
      if (team.roles.length === 0) {
        setLocalError("Add at least one role.");
        return false;
      }
    }

    setLocalError(null);
    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    setLocalError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (step < STEPS.length - 1) {
      event.preventDefault();
      goNext();
    }
  }

  function addRole() {
    const role = team.customRole.trim();
    if (!role) return;
    if (team.roles.some((existing) => existing.toLowerCase() === role.toLowerCase())) {
      return;
    }
    setTeam((current) => ({
      ...current,
      roles: [...current.roles, role],
      customRole: "",
    }));
  }

  function removeRole(role: string) {
    if (team.roles.length <= 1) return;
    setTeam((current) => {
      const roles = current.roles.filter((item) => item !== role);
      const fallbackRole = roles[0] || "Service";
      return {
        ...current,
        roles,
        employees: current.employees.map((employee) =>
          employee.role === role ? { ...employee, role: fallbackRole } : employee
        ),
      };
    });
  }

  function addEmployee() {
    setTeam((current) => ({
      ...current,
      employees: [...current.employees, { ...INITIAL_EMPLOYEE, role: current.roles[0] || "Service" }],
    }));
  }

  function removeEmployee(index: number) {
    setTeam((current) => ({
      ...current,
      employees: current.employees.filter((_, idx) => idx !== index),
    }));
  }

  function updateEmployee(index: number, patch: Partial<TeamEmployee>) {
    setTeam((current) => ({
      ...current,
      employees: current.employees.map((employee, idx) =>
        idx === index ? { ...employee, ...patch } : employee
      ),
    }));
  }

  const activeError = localError || state.error;

  return (
    <form
      action={formAction}
      onSubmit={handleFormSubmit}
      className="mt-6 space-y-5"
      autoComplete="off"
    >
      {/* Autofill trap to reduce browser injecting remembered login credentials into step fields. */}
      <input
        type="text"
        name="fake_username"
        autoComplete="username"
        tabIndex={-1}
        className="hidden"
        aria-hidden="true"
      />
      <input
        type="password"
        name="fake_password"
        autoComplete="current-password"
        tabIndex={-1}
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid grid-cols-3 gap-2">
        {STEPS.map((label, index) => {
          const isActive = index === step;
          const isDone = index < step;
          return (
            <div key={label} className="space-y-1">
              <div
                className={`h-1.5 rounded-full ${
                  isDone || isActive ? "bg-slate-900" : "bg-slate-200"
                }`}
              />
              <p
                className={`text-xs ${
                  isActive ? "font-semibold text-slate-900" : "text-slate-500"
                }`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>

      {activeError ? (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
          {activeError}
        </div>
      ) : null}

      {step === 0 ? (
        <StepAccount
          values={account}
          onChange={(patch) => setAccount((current) => ({ ...current, ...patch }))}
          isLoggedInWithoutMembership={isLoggedInWithoutMembership}
        />
      ) : null}

      {step === 1 ? (
        <StepBusiness
          values={business}
          onChange={(patch) => setBusiness((current) => ({ ...current, ...patch }))}
        />
      ) : null}

      {step === 2 ? (
        <StepTeam
          values={team}
          onChangeCustomRole={(value) => setTeam((current) => ({ ...current, customRole: value }))}
          onAddRole={addRole}
          onRemoveRole={removeRole}
          onUpdateEmployee={updateEmployee}
          onAddEmployee={addEmployee}
          onRemoveEmployee={removeEmployee}
          onToggleInvites={(checked) => setTeam((current) => ({ ...current, sendInvites: checked }))}
        />
      ) : null}

      <input type="hidden" name="first_name" value={account.firstName} />
      <input type="hidden" name="last_name" value={account.lastName} />
      <input type="hidden" name="email" value={account.email} />
      <input type="hidden" name="password" value={account.password} />
      <input type="hidden" name="company_name" value={business.companyName} />
      <input type="hidden" name="country" value={business.country} />
      <input type="hidden" name="business_type" value={business.businessType} />
      <input type="hidden" name="employee_count" value={business.employeeCount} />
      <input type="hidden" name="roles_json" value={serializedRoles} />
      <input type="hidden" name="employees_json" value={serializedEmployees} />
      <input type="hidden" name="send_invites" value={team.sendInvites ? "true" : "false"} />

      <div className="flex items-center justify-between gap-2 pt-2">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0 || pending}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Continue
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-2">
            <button
              type="submit"
              name="skip_team"
              value="true"
              disabled={pending}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Skip for now
            </button>
            <button
              type="submit"
              onClick={(e) => {
                if (!validateCurrentStep()) {
                  e.preventDefault();
                }
              }}
              disabled={pending}
              className="rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {pending ? "Finishing..." : "Finish setup"}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
