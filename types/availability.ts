export type AvailabilityStatus = "undecided" | "can_work" | "cannot_work";

export type EmployeeAvailabilityRow = {
  id: string;
  user_id: string;
  company_id: string;
  date: string;
  status: AvailabilityStatus;
  notes: string | null;
  locked: boolean;
  created_at: string;
  updated_at: string;
};
