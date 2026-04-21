"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  Bell,
  CheckCircle2,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Package2,
  UserRound,
} from "lucide-react";
import { auth, db } from "../lib/firebase";

type ShipperRole = "shipper";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Package2;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Orders in transit", href: "/shipper", icon: LayoutDashboard },
  { label: "Delivered Report", href: "/shipper/delivered", icon: CheckCircle2 },
  { label: "Message", href: "/shipper/messages", icon: MessageSquareText },
  { label: "User Profile", href: "/shipper/profile", icon: UserRound },
];

function isShipperRole(role: unknown): role is ShipperRole {
  return role === "shipper";
}

export default function ShipperLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        router.replace("/");
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const role = userSnap.data()?.role;

        if (!userSnap.exists() || !isShipperRole(role)) {
          router.replace("/");
          return;
        }

        setLoading(false);
      } catch {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const activeHref = useMemo(() => {
    return NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.href;
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff7f5] text-[#8d5750]">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/5">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#dc2626]/25 border-t-[#dc2626]" />
          <span className="text-sm font-medium">Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7f5] text-[#4f342f] lg:pl-[292px]">
      <aside className="fixed inset-y-0 left-0 hidden w-[292px] flex-col border-r border-[#3a0f10] bg-[#0b0b0b] px-5 py-6 text-white shadow-[10px_0_40px_rgba(0,0,0,0.22)] lg:flex">
        <div className="px-2 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#dc2626]">Pizza Hot</h1>
          <p className="mt-1 text-sm text-[#d7b6b1]">Shipper</p>
        </div>

        <nav className="mt-8 flex-1 space-y-4 overflow-y-auto pr-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeHref === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-[18px] px-5 py-4 text-[1.03rem] font-semibold transition ${active ? "bg-[#dc2626] text-white shadow-lg shadow-[#dc2626]/20" : "bg-white text-[#5c4340] hover:bg-[#f6ebe9]"}`}
              >
                <span className="flex items-center gap-4">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </span>
                <Home className="h-4 w-4 rotate-45 opacity-70" />
              </Link>
            );
          })}
        </nav>

        <div className="rounded-[24px] bg-[#121212] p-4 shadow-inner shadow-black/30 ring-1 ring-white/5">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#dc2626] text-white">
              <UserRound className="h-7 w-7" />
            </div>
            <div>
              <div className="text-lg font-bold text-[#f0cec9]">Tên Shipper</div>
              <div className="text-sm text-[#9f817d]">Giao hàng</div>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dc2626] text-white transition hover:bg-[#b91c1c]"
              aria-label="Thông báo"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#dc2626] px-4 py-3 font-semibold text-white transition hover:bg-[#b91c1c]"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-[#eddcda] bg-white/92 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dc2626] text-white shadow-lg shadow-[#dc2626]/20"
            aria-label="Mở menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="text-center leading-tight">
            <div className="text-lg font-extrabold text-[#dc2626]">Pizza Hot</div>
            <div className="text-xs text-[#8a6d68]">Shipper</div>
          </div>

          <Link
            href="/shipper/profile"
            className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dc2626] text-white shadow-lg shadow-[#dc2626]/20"
            aria-label="User Profile"
          >
            <UserRound className="h-5 w-5" />
          </Link>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-[#eddcda] bg-white px-3 py-3">
            <nav className="grid gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeHref === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-[#dc2626] text-white" : "bg-[#fff7f5] text-[#5c4340]"}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}
      </header>

      <main className="min-h-[calc(100vh-64px)] px-4 pb-24 pt-4 lg:px-8 lg:pb-8 lg:pt-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#eddcda] bg-white/96 px-2 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeHref === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium transition ${active ? "bg-[#dc2626] text-white" : "text-[#7f625d]"}`}
              >
                <Icon className="mb-1 h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
