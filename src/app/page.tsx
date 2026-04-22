"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";

const IT_SUPPORT_PHONE = "0348726823";

type Role = "admin" | "staff" | "ctv" | "shipper";


const ROLE_CARDS: Array<{
  id: Role;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    id: "admin",
    label: "QUẢN LÝ",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 20 6v6c0 5-3.2 9.4-8 10-4.8-.6-8-5-8-10V6l8-4Z" />
        <path d="M9.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z" />
      </svg>
    ),
  },
  {
    id: "staff",
    label: "Nhân viên",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m4 20 6-6" />
        <path d="m10 20-6-6" />
        <path d="m14 4 6 6" />
        <path d="m20 4-6 6" />
      </svg>
    ),
  },
  {
    id: "ctv",
    label: "CTV",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 13 12 8l5 5" />
        <path d="M5 11.5 12 4l7 7.5" />
        <path d="M6 20h12" />
      </svg>
    ),
  },
  {
    id: "shipper",
    label: "Giao hàng",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="16" r="2" />
        <circle cx="17" cy="16" r="2" />
        <path d="M5 16h1.5l1.5-5h7l2 5H20" />
        <path d="M10 11V8h3" />
      </svg>
    ),
  },
];

const ROLE_PATHS: Record<Role, string> = {
  admin: "/admin",
  staff: "/staff",
  ctv: "/ctv",
  shipper: "/shipper",
};

const ROLE_ACCESS: Record<Role, Role[]> = {
  admin: ["admin", "staff", "ctv", "shipper"],
  staff: ["staff"],
  ctv: ["ctv"],
  shipper: ["shipper"],
};

function isRole(value: unknown): value is Role {
  return value === "admin" || value === "staff" || value === "ctv" || value === "shipper";
}

function normalizeRole(value: unknown): Role | null {
  if (value === "Admin") return "admin";
  if (value === "Staff") return "staff";
  if (value === "CTV") return "ctv";
  if (value === "Shipper") return "shipper";
  return isRole(value) ? value : null;
}

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<Role>("admin");
  const [error, setError] = useState<string>("");
  const [showSupportDialog, setShowSupportDialog] = useState(false);

  useEffect(() => {
    if (!showSupportDialog) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowSupportDialog(false);
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [showSupportDialog]);

  const canSubmit = useMemo(() => email.trim().length > 0 && password.length > 0 && !loading, [email, password, loading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = credential.user.uid;

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("Tài khoản không được cấp quyền sử dụng hệ thống.");
      }

      const roleValue = normalizeRole(userSnap.data()?.role);
      if (!roleValue) {
        throw new Error("Không xác định được vai trò người dùng.");
      }

      const accountRole = roleValue;
      const allowedRoles = ROLE_ACCESS[accountRole] ?? [accountRole];
      if (!allowedRoles.includes(activeRole)) {
        throw new Error("Tài khoản này không có quyền đăng nhập với vai trò đã chọn.");
      }

      router.replace(ROLE_PATHS[activeRole]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.";
      setError(
        message.includes("auth/invalid-credential") ||
        message.includes("auth/wrong-password") ||
        message.includes("auth/user-not-found")
          ? "Sai tài khoản hoặc mật khẩu. Vui lòng thử lại."
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf7f5] px-4 py-8 text-[#5f4b46] sm:px-6 lg:flex lg:items-center lg:justify-center">
      <div className="mx-auto flex w-full max-w-[420px] flex-col rounded-[22px] bg-white px-6 py-10 shadow-[0_8px_20px_rgba(0,0,0,0.12)] ring-1 ring-black/5 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-[clamp(2.25rem,8vw,3.2rem)] font-extrabold tracking-tight text-[#c4201d]">
            PIZZA HOT
          </h1>
          <p className="mt-1 text-[clamp(0.9rem,3vw,1rem)] font-medium uppercase tracking-[0.08em] text-[#6e5a55]">
            Hệ thống quản trị nội bộ
          </p>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-3">
          {ROLE_CARDS.map((role) => {
            const selected = activeRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRole(role.id)}
                className={`flex min-h-[78px] flex-col items-center justify-center rounded-xl border px-1 py-2 text-center transition ${selected ? "border-[#c4201d] bg-[#c4201d] text-white shadow-sm" : "border-transparent bg-[#f6f4f4] text-[#6d5854] hover:bg-[#f0eded]"}`}
                aria-pressed={selected}
              >
                <span className="mb-1">{role.icon}</span>
                <span className="text-[0.62rem] font-semibold leading-none sm:text-xs">{role.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-[0.78rem] font-extrabold uppercase tracking-[0.03em] text-[#6a5853]">
              Tên đăng nhập
            </span>
            <div className="flex items-center gap-3 rounded-2xl bg-[#f5f3f2] px-4 py-4 ring-1 ring-transparent transition focus-within:ring-[#c4201d]/30">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#9d7f79]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21a8 8 0 1 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="email"
                autoComplete="email"
                placeholder="Tên đăng nhập"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-[0.98rem] text-[#4c3e3a] placeholder:text-[#a48c87] outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-[0.78rem] font-extrabold uppercase tracking-[0.03em] text-[#6a5853]">
              Mật khẩu
            </span>
            <div className="flex items-center gap-3 rounded-2xl bg-[#f5f3f2] px-4 py-4 ring-1 ring-transparent transition focus-within:ring-[#c4201d]/30">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#9d7f79]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-[0.98rem] text-[#4c3e3a] placeholder:text-[#a48c87] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="shrink-0 text-[#9d7f79] transition hover:text-[#c4201d]"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" />
                    <path d="M6.2 6.2A11 11 0 0 0 2 12s3.5 8 10 8c1.8 0 3.4-.4 4.8-1.1" />
                    <path d="M9.9 4.1A10.9 10.9 0 0 1 12 4c6.5 0 10 8 10 8a19 19 0 0 1-4.2 5.3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8-10-8-10-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex w-full items-center justify-center rounded-2xl bg-[#c4201d] px-4 py-4 text-[1rem] font-bold text-white shadow-[0_10px_20px_rgba(196,32,29,0.25)] transition hover:bg-[#ad1b18] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang đăng nhập...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[0.9rem] text-[#8f7872]">
          <p>Gặp khó khăn khi truy cập?</p>
          <button
            type="button"
            onClick={() => setShowSupportDialog(true)}
            className="mt-1 inline-block font-medium text-[#c4201d] hover:underline"
          >
            Liên hệ hỗ trợ kỹ thuật
          </button>
        </div>

        {showSupportDialog ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-sm rounded-[24px] bg-white p-5 shadow-2xl">
              <div className="text-center">
                <h2 className="text-xl font-bold text-[#c4201d]">Liên hệ hỗ trợ kỹ thuật</h2>
                <p className="mt-1 text-sm text-[#6e5a55]">Chọn cách liên hệ phù hợp</p>
              </div>

              <div className="mt-5 space-y-3">
                <a
                  href={`tel:${IT_SUPPORT_PHONE}`}
                  className="flex items-center justify-between rounded-2xl bg-[#f5f3f2] px-4 py-4 font-semibold text-[#4c3e3a] transition hover:bg-[#efeaea]"
                >
                  <span>Số điện thoại</span>
                  <span className="text-[#c4201d]">{IT_SUPPORT_PHONE}</span>
                </a>

                <a
                  href={`https://zalo.me/${IT_SUPPORT_PHONE}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl bg-[#f5f3f2] px-4 py-4 font-semibold text-[#4c3e3a] transition hover:bg-[#efeaea]"
                >
                  <span>Zalo hỗ trợ kỹ thuật</span>
                  <span className="text-[#c4201d]">Mở Zalo</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setShowSupportDialog(false)}
                className="mt-4 w-full rounded-2xl bg-[#c4201d] px-4 py-3 font-bold text-white transition hover:bg-[#ad1b18]"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
