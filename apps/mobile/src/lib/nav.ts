import type { NavItem } from "@/components/layout/dashboard-shell";

export const teacherNav: NavItem[] = [
  { label: "Dashboard", href: "/(teacher)", icon: "view-dashboard-outline" },
  { label: "My Calendar", href: "/(teacher)/calendar", icon: "calendar-month-outline" },
  { label: "Lesson Plans", href: "/(teacher)/lesson-plans", icon: "book-open-page-variant-outline" },
  { label: "Teaching Notes", href: "/(teacher)/teaching-notes", icon: "file-document-outline" },
  { label: "Assessments", href: "/(teacher)/assessments", icon: "clipboard-text-outline" },
  { label: "Progress", href: "/(teacher)/profile", icon: "chart-line" }
];

export const departmentNav: NavItem[] = [
  { label: "Overview", href: "/(department)", icon: "view-dashboard-outline" },
  { label: "Teacher Progress", href: "/(department)/teacher-progress", icon: "account-group-outline" },
  { label: "Reviews", href: "/(department)/reviews", icon: "file-document-edit-outline" },
  { label: "Reports", href: "/(department)/reports", icon: "chart-box-outline" }
];

export const leaderNav: NavItem[] = [
  { label: "Dashboard", href: "/(leader)", icon: "school-outline" },
  { label: "Department Reports", href: "/(leader)/reports", icon: "chart-box-outline" },
  { label: "Analytics", href: "/(leader)/analytics", icon: "chart-timeline-variant" }
];

export const adminNav: NavItem[] = [{ label: "Calendars", href: "/(admin)/calendars", icon: "calendar-month-outline" }];
