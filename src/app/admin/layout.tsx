"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  BarChart3,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PackagePlus,
  Settings2,
  ShoppingBag,
  Store,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { auth, db } from "../lib/firebase";

type AdminRole = "admin";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Trang chủ", href: "/admin", icon: LayoutDashboard },
  { label: "Báo cáo", href: "/admin/reports", icon: BarChart3 },
  { label: "Tạo đơn hàng", href: "/admin/orders/new", icon: PackagePlus },
  { label: "Quản lý đơn hàng", href: "/admin/orders", icon: ClipboardList },
  { label: "Đơn hàng", href: "/admin/orders/active", icon: ShoppingBag },
  { label: "Nhân sự", href: "/admin/staff", icon: Users },
  { label: "Món ăn", href: "/admin/menu", icon: UtensilsCrossed },
  { label: "Vị trí", href: "/admin/branches", icon: Store },
  { label: "Tin nhắn", href: "/admin/messages", icon: MessageSquareText },
  { label: "Cá nhân", href: "/admin/profile", icon: Settings2 },
];

function isAdminRole(role: unknown): role is AdminRole {
  return role === "admin";
}

export default function AdminLayout({ children }: { children: ReactNode }) {
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

        if (!userSnap.exists() || !isAdminRole(role)) {
          await auth.signOut();
          router.replace("/");
          return;
        }

        setLoading(false);
      } catch {
        await auth.signOut();
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf7f6] text-[#7c5c57]">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/5">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#dc2626]/25 border-t-[#dc2626]" />
          <span className="text-sm font-medium">Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f6] text-[#4f342f] lg:pl-[280px]">
      <aside className="fixed inset-y-0 left-0 hidden w-[280px] flex-col border-r border-[#2b0e0e] bg-[#0a0a0a] px-5 py-6 text-white shadow-[10px_0_40px_rgba(0,0,0,0.25)] lg:flex">
        <div className="px-2 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#dc2626]">Pizza Hot</h1>
          <p className="mt-1 text-sm text-[#c9a9a5]">Quản lý</p>
        </div>

        <nav className="mt-8 flex-1 space-y-4 overflow-y-auto pr-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-[18px] px-5 py-4 text-[1.05rem] font-semibold transition ${active ? "bg-[#dc2626] text-white shadow-lg shadow-[#dc2626]/20" : "bg-white text-[#5c4340] hover:bg-[#f4e9e7]"}`}
              >
                <span className="flex items-center gap-4">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </span>
                <ChevronRight className="h-4 w-4 opacity-70" />
              </a>
            );
          })}
        </nav>

        <div className="mt-6 rounded-[24px] bg-[#111111] p-4 shadow-inner shadow-black/30 ring-1 ring-white/5">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#dc2626] text-white">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <div className="text-lg font-bold text-[#e8c8c5]">Tên nhân viên</div>
              <div className="text-sm text-[#8f7170]">Quản trị viên</div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dc2626] text-white transition hover:bg-[#b91c1c]">
              <LogOut className="h-5 w-5" />
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#dc2626] px-4 py-3 font-semibold text-white transition hover:bg-[#b91c1c]">
              <ChevronRight className="h-4 w-4 rotate-180" />
              Cá nhân
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#eddcda] bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dc2626] text-white"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="text-lg font-extrabold text-[#dc2626]">Pizza Hot</div>
          <div className="text-xs text-[#8a6d68]">Quản lý</div>
        </div>
        <div className="h-11 w-11" />
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute left-0 top-0 h-full w-[82%] max-w-[320px] bg-[#0a0a0a] p-5 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2 text-center">
              <h1 className="text-3xl font-extrabold text-[#dc2626]">Pizza Hot</h1>
              <p className="text-sm text-[#c9a9a5]">Quản lý</p>
            </div>
            <div className="mt-6 space-y-3">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold ${active ? "bg-[#dc2626] text-white" : "bg-white text-[#5c4340]"}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <main className="min-h-[calc(100vh-64px)] px-4 pb-24 pt-4 lg:px-8 lg:pb-8 lg:pt-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#eddcda] bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium ${active ? "bg-[#dc2626] text-white" : "text-[#7f625d]"}`}
              >
                <Icon className="mb-1 h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
