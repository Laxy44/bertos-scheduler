"use client";

import { useRef } from "react";
import type { AppTab } from "../../types/schedule";
import { AnchoredMenu } from "../ui/AnchoredMenu";

export type WorkspaceAppNavProps = {
  isAdmin: boolean;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  navUserLabel: string;
  isHomeMenuOpen: boolean;
  isScheduleMenuOpen: boolean;
  isPeopleMenuOpen: boolean;
  isPayrollMenuOpen: boolean;
  isSettingsMenuOpen: boolean;
  isUserMenuOpen: boolean;
  onToggleHomeMenu: () => void;
  onToggleScheduleMenu: () => void;
  onTogglePeopleMenu: () => void;
  onTogglePayrollMenu: () => void;
  onToggleSettingsMenu: () => void;
  onToggleUserMenu: () => void;
  closeAllNavMenus: () => void;
  openHomeMenuTab: (tab: AppTab) => void;
  openHomeMenuRoute: (path: string) => void;
  openScheduleMenuTab: (tab: AppTab) => void;
  openScheduleMenuRoute: (path: string) => void;
  openPeopleMenuTab: (tab: AppTab) => void;
  openPayrollMenuTab: (tab: AppTab) => void;
  openPayrollMenuRoute: (path: string) => void;
  openSettingsMenuRoute: (path: string) => void;
  openUserMenuRoute: (path: string) => void;
  onLogout: () => void;
};

const navBtn =
  "inline-flex h-9 items-center gap-1 rounded-md border-b-2 border-transparent px-3 text-sm font-medium transition";
const navBtnActive = "border-indigo-400 bg-slate-800/80 text-white";
const navBtnIdle =
  "text-slate-300 hover:border-transparent hover:bg-slate-800/60 hover:text-white";

const menuItem =
  "w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50";

/**
 * LEVEL 1 — Dark workspace navigation with portaled dropdowns (no clipping under grids).
 */
export default function WorkspaceAppNav({
  isAdmin,
  activeTab,
  setActiveTab,
  navUserLabel,
  isHomeMenuOpen,
  isScheduleMenuOpen,
  isPeopleMenuOpen,
  isPayrollMenuOpen,
  isSettingsMenuOpen,
  isUserMenuOpen,
  onToggleHomeMenu,
  onToggleScheduleMenu,
  onTogglePeopleMenu,
  onTogglePayrollMenu,
  onToggleSettingsMenu,
  onToggleUserMenu,
  closeAllNavMenus,
  openHomeMenuTab,
  openHomeMenuRoute,
  openScheduleMenuTab,
  openScheduleMenuRoute,
  openPeopleMenuTab,
  openPayrollMenuTab,
  openPayrollMenuRoute,
  openSettingsMenuRoute,
  openUserMenuRoute,
  onLogout,
}: WorkspaceAppNavProps) {
  const homeRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const peopleRef = useRef<HTMLDivElement>(null);
  const payrollRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 text-slate-100 shadow-lg shadow-slate-950/20">
      <div className="flex h-14 w-full items-center justify-between px-4 xl:px-6 2xl:px-8">
        <span className="text-lg font-semibold tracking-tight text-white">Planyo</span>
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={onToggleUserMenu}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition md:px-3 ${
              isUserMenuOpen ? "bg-slate-800 text-white" : "text-slate-200 hover:bg-slate-800/80"
            }`}
          >
            {navUserLabel}
            <span className="text-xs opacity-70">▾</span>
          </button>
          <AnchoredMenu
            open={isUserMenuOpen}
            onClose={closeAllNavMenus}
            anchorRef={userRef}
            align="end"
            contentClassName="w-44"
          >
            <button
              type="button"
              className={menuItem}
              onClick={() => openUserMenuRoute("/profile")}
            >
              Profile
            </button>
            <button
              type="button"
              className={menuItem}
              onClick={() => openUserMenuRoute("/account")}
            >
              Account
            </button>
            <button type="button" className={menuItem} onClick={onLogout}>
              Log out
            </button>
          </AnchoredMenu>
        </div>
      </div>

      <nav
        aria-label="Main"
        className="flex flex-wrap items-center gap-x-1 gap-y-1 border-t border-slate-800/80 px-3 py-2 xl:px-5 2xl:px-7"
      >
        <div className="relative" ref={homeRef}>
          <button
            type="button"
            onClick={onToggleHomeMenu}
            className={`${navBtn} ${
              activeTab === "home" || isHomeMenuOpen ? navBtnActive : navBtnIdle
            }`}
          >
            Home <span className="text-[10px] opacity-70">▾</span>
          </button>
          <AnchoredMenu
            open={isHomeMenuOpen}
            onClose={closeAllNavMenus}
            anchorRef={homeRef}
            contentClassName="w-56"
          >
            <button type="button" className={menuItem} onClick={() => openHomeMenuTab("home")}>
              Home
            </button>
            <button
              type="button"
              className={menuItem}
              onClick={() => openHomeMenuTab("schedule")}
            >
              {isAdmin ? "Schedule" : "Your schedule"}
            </button>
            <button
              type="button"
              className={menuItem}
              onClick={() => openHomeMenuRoute("/your-availability")}
            >
              Your availability
            </button>
            <button
              type="button"
              className={menuItem}
              onClick={() => openHomeMenuRoute("/your-leave-overview")}
            >
              Your leave overview
            </button>
            <button
              type="button"
              className={menuItem}
              onClick={() => openHomeMenuRoute("/payslips")}
            >
              Payslips
            </button>
            <button type="button" className={menuItem} onClick={() => openHomeMenuRoute("/news")}>
              News
            </button>
            <button
              type="button"
              className={menuItem}
              onClick={() => openHomeMenuRoute("/events")}
            >
              Events
            </button>
          </AnchoredMenu>
        </div>

        <div className="relative" ref={scheduleRef}>
          <button
            type="button"
            onClick={onToggleScheduleMenu}
            className={`${navBtn} ${
              activeTab === "schedule" || isScheduleMenuOpen ? navBtnActive : navBtnIdle
            }`}
          >
            {isAdmin ? "Schedule" : "Your schedule"}{" "}
            <span className="text-[10px] opacity-70">▾</span>
          </button>
          <AnchoredMenu
            open={isScheduleMenuOpen}
            onClose={closeAllNavMenus}
            anchorRef={scheduleRef}
            contentClassName="w-56"
          >
            <button
              type="button"
              className={menuItem}
              onClick={() => openScheduleMenuTab("schedule")}
            >
              {isAdmin ? "Schedule" : "Your schedule"}
            </button>
            {isAdmin ? (
              <>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openScheduleMenuRoute("/pending-requests")}
                >
                  Pending requests
                </button>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openScheduleMenuRoute("/punch-clock")}
                >
                  Punch Clock
                </button>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openScheduleMenuRoute("/availability")}
                >
                  Availability
                </button>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openScheduleMenuRoute("/leave-requests")}
                >
                  Leave requests
                </button>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openScheduleMenuRoute("/contracted-hours")}
                >
                  Contracted hours
                </button>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openScheduleMenuRoute("/leave-accounts")}
                >
                  Leave accounts
                </button>
              </>
            ) : (
              <button
                type="button"
                className={menuItem}
                onClick={() => openScheduleMenuRoute("/punch-clock")}
              >
                Punch clock
              </button>
            )}
          </AnchoredMenu>
        </div>

        {isAdmin ? (
          <div className="relative" ref={peopleRef}>
            <button
              type="button"
              onClick={onTogglePeopleMenu}
              className={`${navBtn} ${
                activeTab === "employees" || isPeopleMenuOpen ? navBtnActive : navBtnIdle
              }`}
            >
              People <span className="text-[10px] opacity-70">▾</span>
            </button>
            <AnchoredMenu
              open={isPeopleMenuOpen}
              onClose={closeAllNavMenus}
              anchorRef={peopleRef}
              contentClassName="w-60"
            >
              <button
                type="button"
                className={`${menuItem} ${
                  activeTab === "employees" ? "bg-slate-100 font-semibold text-slate-900" : ""
                }`}
                onClick={() => openPeopleMenuTab("employees")}
              >
                Employees
              </button>
              <button type="button" className={`${menuItem} text-slate-400`} disabled>
                Employee groups
              </button>
              <button type="button" className={`${menuItem} text-slate-400`} disabled>
                Departments
              </button>
              <button type="button" className={`${menuItem} text-slate-400`} disabled>
                Contracts
              </button>
              <button type="button" className={`${menuItem} text-slate-400`} disabled>
                Documents
              </button>
            </AnchoredMenu>
          </div>
        ) : null}

        {isAdmin ? (
          <div className="relative" ref={payrollRef}>
            <button
              type="button"
              onClick={onTogglePayrollMenu}
              className={`${navBtn} ${
                activeTab === "payroll" || isPayrollMenuOpen ? navBtnActive : navBtnIdle
              }`}
            >
              Payroll <span className="text-[10px] opacity-70">▾</span>
            </button>
            <AnchoredMenu
              open={isPayrollMenuOpen}
              onClose={closeAllNavMenus}
              anchorRef={payrollRef}
              contentClassName="w-64"
            >
              <button
                type="button"
                className={menuItem}
                onClick={() => openPayrollMenuTab("payroll")}
              >
                Payroll report
              </button>
              <button
                type="button"
                className={menuItem}
                onClick={() => openPayrollMenuRoute("/payroll/lock-date-range")}
              >
                Lock date range for payroll
              </button>
              <button
                type="button"
                className={menuItem}
                onClick={() => openPayrollMenuRoute("/payroll/import-payslips")}
              >
                Import payslips
              </button>
            </AnchoredMenu>
          </div>
        ) : null}

        <div className="relative" ref={settingsRef}>
          <button
            type="button"
            onClick={onToggleSettingsMenu}
            className={`${navBtn} ${isSettingsMenuOpen ? navBtnActive : navBtnIdle}`}
          >
            Settings <span className="text-[10px] opacity-70">▾</span>
          </button>
          <AnchoredMenu
            open={isSettingsMenuOpen}
            onClose={closeAllNavMenus}
            anchorRef={settingsRef}
            contentClassName="w-56"
          >
            {isAdmin ? (
              <>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openSettingsMenuRoute("/settings/workspace")}
                >
                  Workspace settings
                </button>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openSettingsMenuRoute("/settings/company")}
                >
                  Company details
                </button>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openSettingsMenuRoute("/settings/roles")}
                >
                  Roles & permissions
                </button>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openSettingsMenuRoute("/settings/notifications")}
                >
                  Notifications
                </button>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openSettingsMenuRoute("/settings/integrations")}
                >
                  Integrations
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openUserMenuRoute("/profile")}
                >
                  Profile
                </button>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openUserMenuRoute("/account")}
                >
                  Account
                </button>
              </>
            )}
          </AnchoredMenu>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1 border-l border-slate-800/80 pl-2">
          {(
            [
              { key: "week" as const, label: "Week view" },
              { key: "month" as const, label: "Month view" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`${navBtn} ${
                activeTab === tab.key ? navBtnActive : navBtnIdle
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
