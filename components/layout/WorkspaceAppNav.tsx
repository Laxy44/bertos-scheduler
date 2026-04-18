"use client";

import { useRef } from "react";
import type { AppTab } from "../../types/schedule";
import { AnchoredMenu } from "../ui/AnchoredMenu";

export type WorkspaceAppNavProps = {
  isAdmin: boolean;
  activeTab: AppTab;
  navUserLabel: string;
  isHomeMenuOpen: boolean;
  isScheduleMenuOpen: boolean;
  isPeopleMenuOpen: boolean;
  isReportsMenuOpen: boolean;
  isPayrollNavOpen: boolean;
  isSettingsMenuOpen: boolean;
  isUserMenuOpen: boolean;
  onToggleHomeMenu: () => void;
  onToggleScheduleMenu: () => void;
  onTogglePeopleMenu: () => void;
  onToggleReportsMenu: () => void;
  onTogglePayrollNavMenu: () => void;
  onToggleSettingsMenu: () => void;
  onToggleUserMenu: () => void;
  closeAllNavMenus: () => void;
  openHomeMenuTab: (tab: AppTab) => void;
  openHomeMenuRoute: (path: string) => void;
  openScheduleMenuTab: (tab: AppTab) => void;
  openScheduleMenuRoute: (path: string) => void;
  openPeopleMenuTab: (tab: AppTab) => void;
  openReportsMenuTab: (tab: AppTab) => void;
  openPayrollSectionTab: (tab: AppTab) => void;
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
  navUserLabel,
  isHomeMenuOpen,
  isScheduleMenuOpen,
  isPeopleMenuOpen,
  isReportsMenuOpen,
  isPayrollNavOpen,
  isSettingsMenuOpen,
  isUserMenuOpen,
  onToggleHomeMenu,
  onToggleScheduleMenu,
  onTogglePeopleMenu,
  onToggleReportsMenu,
  onTogglePayrollNavMenu,
  onToggleSettingsMenu,
  onToggleUserMenu,
  closeAllNavMenus,
  openHomeMenuTab,
  openHomeMenuRoute,
  openScheduleMenuTab,
  openScheduleMenuRoute,
  openPeopleMenuTab,
  openReportsMenuTab,
  openPayrollSectionTab,
  openSettingsMenuRoute,
  openUserMenuRoute,
  onLogout,
}: WorkspaceAppNavProps) {
  const homeRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const peopleRef = useRef<HTMLDivElement>(null);
  const reportsRef = useRef<HTMLDivElement>(null);
  const payrollNavRef = useRef<HTMLDivElement>(null);
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
              onClick={() => openUserMenuRoute("/app/profile")}
            >
              Profile
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
              Dashboard
            </button>
            <button type="button" className={menuItem} onClick={() => openHomeMenuRoute("/app/your-schedule")}>
              Your schedule
            </button>
            <button
              type="button"
              className={menuItem}
              onClick={() => openHomeMenuRoute("/app/your-availability")}
            >
              Your availability
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
                  onClick={() => openScheduleMenuRoute("/app/pending-requests")}
                >
                  Pending requests
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={menuItem}
                  onClick={() => openScheduleMenuRoute("/app/your-schedule")}
                >
                  Your schedule
                </button>
              </>
            )}
          </AnchoredMenu>
        </div>

        {isAdmin ? (
          <div className="relative" ref={peopleRef}>
            <button
              type="button"
              onClick={onTogglePeopleMenu}
              className={`${navBtn} ${
                activeTab === "employees" ||
                activeTab === "employee-groups" ||
                isPeopleMenuOpen
                  ? navBtnActive
                  : navBtnIdle
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
              <button
                type="button"
                className={`${menuItem} ${
                  activeTab === "employee-groups"
                    ? "bg-slate-100 font-semibold text-slate-900"
                    : ""
                }`}
                onClick={() => openPeopleMenuTab("employee-groups")}
              >
                Employee groups
              </button>
            </AnchoredMenu>
          </div>
        ) : null}

        {isAdmin ? (
          <div className="relative" ref={reportsRef}>
            <button
              type="button"
              onClick={onToggleReportsMenu}
              className={`${navBtn} ${
                activeTab === "reports-timesheets" || isReportsMenuOpen ? navBtnActive : navBtnIdle
              }`}
            >
              Reports <span className="text-[10px] opacity-70">▾</span>
            </button>
            <AnchoredMenu
              open={isReportsMenuOpen}
              onClose={closeAllNavMenus}
              anchorRef={reportsRef}
              contentClassName="w-56"
            >
              <button
                type="button"
                className={`${menuItem} ${
                  activeTab === "reports-timesheets"
                    ? "bg-slate-100 font-semibold text-slate-900"
                    : ""
                }`}
                onClick={() => openReportsMenuTab("reports-timesheets")}
              >
                Timesheets
              </button>
            </AnchoredMenu>
          </div>
        ) : null}

        {isAdmin ? (
          <div className="relative" ref={payrollNavRef}>
            <button
              type="button"
              onClick={onTogglePayrollNavMenu}
              className={`${navBtn} ${
                activeTab === "payroll-overview" ||
                activeTab === "payroll-employee" ||
                isPayrollNavOpen
                  ? navBtnActive
                  : navBtnIdle
              }`}
            >
              Payroll <span className="text-[10px] opacity-70">▾</span>
            </button>
            <AnchoredMenu
              open={isPayrollNavOpen}
              onClose={closeAllNavMenus}
              anchorRef={payrollNavRef}
              contentClassName="w-56"
            >
              <button
                type="button"
                className={`${menuItem} ${
                  activeTab === "payroll-overview"
                    ? "bg-slate-100 font-semibold text-slate-900"
                    : ""
                }`}
                onClick={() => openPayrollSectionTab("payroll-overview")}
              >
                Overview
              </button>
              <button
                type="button"
                className={`${menuItem} ${
                  activeTab === "payroll-employee"
                    ? "bg-slate-100 font-semibold text-slate-900"
                    : ""
                }`}
                onClick={() => openPayrollSectionTab("payroll-employee")}
              >
                Employee payroll
              </button>
            </AnchoredMenu>
          </div>
        ) : null}

        {isAdmin ? (
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
              <button
                type="button"
                className={menuItem}
                onClick={() => openSettingsMenuRoute("/app/settings/general")}
              >
                General
              </button>
              <button
                type="button"
                className={menuItem}
                onClick={() => openSettingsMenuRoute("/app/settings/schedule")}
              >
                Schedule
              </button>
              <button
                type="button"
                className={menuItem}
                onClick={() => openSettingsMenuRoute("/app/settings/employees")}
              >
                Employees
              </button>
              <button
                type="button"
                className={menuItem}
                onClick={() => openSettingsMenuRoute("/app/settings/payroll")}
              >
                Payroll
              </button>
              <button
                type="button"
                className={menuItem}
                onClick={() => openSettingsMenuRoute("/app/settings/security")}
              >
                Security
              </button>
            </AnchoredMenu>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
