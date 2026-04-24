"use client";

import Image from "next/image";
import { useState } from "react";
import { Camera, Check, Coins, Edit, Mail, Phone, User, User2 } from "lucide-react";

type ProfileForm = {
  fullName: string;
  phone: string;
  email: string;
  bankAccount: string;
};

const initialProfile: ProfileForm = {
  fullName: "Nguyễn Văn A",
  phone: "0901 234 567",
  email: "nguyenvana@pizzahot.com",
  bankAccount: "0123456789",
};

export default function CtvProfilePage() {
  const [form, setForm] = useState<ProfileForm>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <main className="min-h-dvh bg-[#fbf7f6] text-[#2b1d1a]">
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-4 sm:px-5 sm:py-6 lg:px-6">
        <section className="rounded-[30px] bg-gradient-to-br from-white to-[#fff8f6] p-5 shadow-[0_14px_40px_rgba(97,39,25,0.08)] ring-1 ring-[#f0dfda] sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[28px] bg-gradient-to-br from-[#c62828] to-[#dc2626] p-5 text-white shadow-[0_16px_40px_rgba(198,40,40,0.22)] ring-1 ring-white/10 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/75">Tổng thu nhập</p>
                  <div className="mt-3 text-[2.2rem] font-black tracking-tight sm:text-[2.8rem]">18.500.000đ</div>
                  <p className="mt-2 text-sm text-white/80">Thu nhập + hoa hồng tạm tính trong tháng hiện tại</p>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                  <Coins className="h-7 w-7" />
                </div>
              </div>
            </article>

            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#b58f88]">
                Hồ sơ & cài đặt tài khoản
              </p>
              <h1 className="text-2xl font-black tracking-tight text-[#3b2420] sm:text-3xl">Hồ sơ cá nhân</h1>
              <p className="max-w-2xl text-sm leading-6 text-[#94736d] sm:text-base">Cập nhật thông tin cá nhân và tài khoản ngân hàng nhận lương/hoa hồng.</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditing((current) => !current)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#c62828] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_22px_rgba(198,40,40,0.25)] transition active:scale-[0.99]"
            >
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
            <div className="rounded-[28px] bg-white p-5 text-center shadow-[0_10px_28px_rgba(97,39,25,0.06)] ring-1 ring-[#f1e4e0] sm:p-6">
              <div className="relative mx-auto h-28 w-28 sm:h-32 sm:w-32">
                <div className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#ffe1dc] to-[#f7b7ad] shadow-[0_12px_30px_rgba(97,39,25,0.18)] ring-4 ring-white">
                  <Image
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80"
                    alt="Avatar nhân viên"
                    width={160}
                    height={160}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full bg-[#c62828] text-white shadow-[0_10px_20px_rgba(198,40,40,0.35)] ring-4 ring-white"
                  aria-label="Đổi avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-1">
                <h2 className="text-xl font-extrabold tracking-tight text-[#3b2420]">
                  {form.fullName}
                </h2>
                <p className="text-sm font-medium text-[#9b7a73]">Quản trị viên</p>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff4f2] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#b84f46]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Đang hoạt động
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Họ và tên" icon={User} value={form.fullName} onChange={(value) => handleChange("fullName", value)} disabled={!isEditing} placeholder="Tên nhân viên" />
                <Field label="Số điện thoại" icon={Phone} value={form.phone} onChange={(value) => handleChange("phone", value)} disabled={!isEditing} placeholder="Số điện thoại" />
                <Field label="Email" icon={Mail} value={form.email} onChange={(value) => handleChange("email", value)} disabled placeholder="tennhanvien@pizzahot.com" />
                <Field label="Vị trí công tác" icon={User2} value="Đối tác bán hàng" onChange={() => {}} disabled placeholder="Vị trí công tác" />
                <Field label="Cấp bậc (VIP)" icon={Check} value="VIP 1" onChange={() => {}} disabled placeholder="Cấp bậc" />
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#c62828] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(198,40,40,0.22)] transition active:scale-[0.99]"
                >
                  Lưu thay đổi
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-[#6d4c46] ring-1 ring-[#edded9] transition active:scale-[0.99]"
                >
                  Hủy
                </button>
              </div>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder: string;
  icon: typeof User2;
};

function Field({ label, value, onChange, disabled, placeholder, icon: Icon }: FieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-[#6a4c46]">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[0_8px_22px_rgba(97,39,25,0.04)] ring-1 ring-[#eaded9] transition focus-within:ring-[#c62828]">
        <Icon className="h-4 w-4 shrink-0 text-[#be8e85]" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-medium text-[#2c1f1b] outline-none placeholder:text-[#b39690] disabled:cursor-not-allowed disabled:text-[#5f4741]"
        />
      </div>
    </label>
  );
}
