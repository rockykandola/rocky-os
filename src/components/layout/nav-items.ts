import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, FolderKanban, ListChecks, Brain, CalendarClock, Plug } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Tasks", href: "/tasks", icon: ListChecks },
  { title: "Brain Dump", href: "/brain-dump", icon: Brain },
  { title: "Planner", href: "/planner", icon: CalendarClock },
  { title: "Integrations", href: "/integrations", icon: Plug },
];
