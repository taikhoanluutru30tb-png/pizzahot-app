"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  ChevronRight,
  Home,
  LogOut,
  MessageSquare,
  ShoppingBag,
  SquarePen,
  UserRound,
  UserRoundPen,
} from "lucide-react";
import { auth, db } from "../lib/firebase";

const SUPPORT_EMAIL = "quanlypizzahot@gmail.com";

type CtvRole = "ctv";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Trang chủ", href: "/ctv", icon: Home },
  { label: "Tạo đơn hàng", href: "/ctv/create-order", icon: SquarePen },
  { label: "Lịch sử đơn hàng", href: "/ctv/orders", icon: ShoppingBag },
  { label: "Tin nhắn", href: "/ctv/message", icon: MessageSquare },
  { label: "Hồ sơ", href: "/ctv/profile", icon: UserRoundPen },
];

function isCtvRole(role: unknown): role is CtvRole {
  return role === "ctv";
}

function isSupportEmail(value: unknown): value is string {
  return typeof value === "string" && value.toLowerCase() === SUPPORT_EMAIL;
}

export default function CtvLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Tên nhân viên");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setLoading(false);
        router.replace("/");
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const userData = userSnap.data();
        const role = userData?.role;
        const canAccessAsSupport = isSupportEmail(user.email) && userData?.blocked !== true;

        if (!userSnap.exists() || (!isCtvRole(role) && !canAccessAsSupport)) {
          await signOut(auth);
          setLoading(false);
          router.replace("/");
          return;
        }

        const profileName =
          (userSnap.data()?.displayName as string | undefined) ||
          user.displayName ||
          user.email?.split("@")[0] ||
          "CTV";

        setDisplayName(profileName);
        setLoading(false);
      } catch {
        await signOut(auth);
        setLoading(false);
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

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
      <aside className="fixed inset-y-0 left-0 hidden w-[292px] flex-col border-r border-[#2a0d0d] bg-[#070707] px-5 py-6 text-white shadow-[10px_0_40px_rgba(0,0,0,0.22)] lg:flex">
        <div className="px-2 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#dc2626]">Pizza Hot</h1>
          <p className="mt-1 text-sm text-[#d7b6b1]">CTV</p>
        </div>

        <nav className="mt-8 flex-1 space-y-4 overflow-y-auto pr-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

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
                <ChevronRight className="h-4 w-4 opacity-70" />
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-[24px] bg-[#121212] p-4 shadow-inner shadow-black/30 ring-1 ring-white/5">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-[#dc2626] text-white">
              <Image
                src="/avatar-sidebar.png"
                alt="Ảnh đại diện"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="text-lg font-bold text-[#f0cec9]">{displayName}</div>
              <div className="text-sm text-[#9f817d]">CTV</div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dc2626] text-white transition hover:bg-[#b91c1c]"
              aria-label="Thông tin cá nhân"
              onClick={() => router.push("/ctv/profile")}
            >
              <UserRound className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#dc2626] px-4 py-3 font-semibold text-white transition hover:bg-[#b91c1c]"
              onClick={async () => {
                await auth.signOut();
                router.replace("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-[#eddcda] bg-white/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="h-11 w-11" />

          <div className="text-center">
            <div className="text-lg font-extrabold text-[#dc2626]">Pizza Hot</div>
            <div className="text-xs text-[#8a6d68]">CTV</div>
          </div>

          <Link
            href="/ctv/profile"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[#111111] text-white"
            aria-label="Hồ sơ"
          >
            <UserRound className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)] px-4 pb-32 pt-4 lg:px-8 lg:pb-8 lg:pt-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#eddcda] bg-white/96 px-2 py-2 backdrop-blur lg:hidden">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-[78px] flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium transition ${active ? "bg-[#dc2626] text-white" : "bg-transparent text-[#7f625d]"}`}
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
