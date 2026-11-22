"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Clock3, UserRoundX } from "lucide-react";

const items = [
  { href: "/dashboard/", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/unfollowers/", label: "Unfollowers", icon: UserRoundX },
  { href: "/dashboard/history/", label: "Riwayat Data", icon: Clock3 },
];

export function DashboardNav() {
  const path = usePathname();
  const currentPath = path.endsWith("/") ? path : `${path}/`;
  return (
    <nav className="dashboard-nav" aria-label="Navigasi dashboard">
      {items.map(({ href, label, icon: Icon }) => {
        const active = currentPath === href || (href !== "/dashboard/" && currentPath.startsWith(href));
        return <Link className={`dashboard-nav__link${active ? " is-active" : ""}`} href={href} key={href} aria-current={active ? "page" : undefined}>
          <Icon size={17} strokeWidth={1.9} />{label}
        </Link>;
      })}
    </nav>
  );
}
