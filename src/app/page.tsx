"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, Lock, Shield, Truck, User, Users } from "lucide-react";
import { auth } from "./lib/firebase";
import { getRoleHomePath, loadCurrentUserRole, type AppRole } from "./lib/role-guard";

const IT_SUPPORT_PHONE = "0348726823";

type Role = AppRole;

const ROLE_CARDS: Array<{
  id: Role;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    id: "admin",
    label: "QUẢN LÝ",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: "staff",
    label: "Nhân viên",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "ctv",
    label: "CTV",
    icon: <User className="h-5 w-5" />,
  },
  {
    id: "shipper",
    label: "Giao hàng",
    icon: <Truck className="h-5 w-5" />,
  },
];

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
      const { snapshot, data, role } = await loadCurrentUserRole(credential.user.uid);

      if (!snapshot.exists()) {
        throw new Error("Tài khoản không được cấp quyền sử dụng hệ thống.");
      }

      if (data?.blocked === true) {
        throw new Error("Tài khoản đã bị khóa.");
      }

      const accountRole = role ?? (data?.is_support === true ? "admin" : null);
      if (!accountRole) {
        throw new Error("Không xác định được vai trò người dùng.");
      }

      const targetPath = getRoleHomePath(accountRole);
      router.replace(targetPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.";
      setError(
        message.includes("auth/invalid-credential") ||
        message.includes("auth/wrong-password") ||
        message.includes("auth/user-not-found")
          ? "Sai tài khoản hoặc mật khẩu. Vui lòng thử lại."
          : message,
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
              <User className="h-5 w-5 shrink-0 text-[#9d7f79]" />
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
              <Lock className="h-5 w-5 shrink-0 text-[#9d7f79]" />
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
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
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
