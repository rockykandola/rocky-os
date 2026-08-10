import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Brain,
  CalendarClock,
  Plug,
  BookOpen,
  Sparkles,
  Users,
  Mail,
  Compass,
} from "lucide-react";

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
  { title: "Journal", href: "/journal", icon: BookOpen },
  { title: "Habits", href: "/habits", icon: Sparkles },
  { title: "Contacts", href: "/contacts", icon: Users },
  { title: "Gmail", href: "/gmail", icon: Mail },
  { title: "Project Foundation", href: "/project-foundation", icon: Compass },
  { title: "Integrations", href: "/integrations", icon: Plug },
];
