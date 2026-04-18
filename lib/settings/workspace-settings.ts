/**
 * Typed slices of `companies.workspace_settings` (jsonb).
 * Reserved for future: integrations, advanced payroll, leave rules — keep keys stable.
 */

export type ShiftTypeRow = { id: string; name: string };

export type ScheduleWorkspaceSlice = {
  shiftTypes?: ShiftTypeRow[];
  breakRules?: {
    /** Paid or scheduled break length (minutes); informational for now. */
    defaultBreakMinutes?: number;
    /** Minimum gap between shifts for the same person. */
    minGapBetweenShiftsMinutes?: number;
  };
};

export type EmployeeWorkspaceSlice = {
  showEmailField?: boolean;
  showPhoneField?: boolean;
};

export type WorkspaceSettingsDoc = {
  schedule?: ScheduleWorkspaceSlice;
  employee?: EmployeeWorkspaceSlice;
};

export function parseWorkspaceSettings(raw: unknown): WorkspaceSettingsDoc {
  if (!raw || typeof raw !== "object") return {};
  return raw as WorkspaceSettingsDoc;
}

export function newShiftTypeId() {
  return `st_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
