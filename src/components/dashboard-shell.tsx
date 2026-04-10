"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building, CheckSquare, DollarSign, Home, Share2, Users } from "lucide-react";

const navLinks = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/social", label: "Social", icon: Share2 },
  { href: "/finance", label: "Finance", icon: DollarSign },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/guests", label: "Guests", icon: Users },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <Building size={24} />
          <span>MySTR</span>
        </div>

        <nav className="nav-links">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} className={`nav-link ${isActive ? "active" : ""}`}>
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}

