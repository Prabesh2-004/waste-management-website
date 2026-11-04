import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Page heading shown in the header. */
  title: string;
  subtitle: string;
  /** Optional third header line. */
  note?: string;
}

export interface PortalUser {
  name: string;
  role: string;
  initials: string;
}
