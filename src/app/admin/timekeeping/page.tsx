"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BellRing, BriefcaseBusiness, CalendarClock, Check, Clock, DollarSign, Gauge, Save, ShieldAlert, Smartphone } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "@/app/lib/firebase";

type Shift = {
  id: string;
  name: string;
  start: string;
  end: string;
  wage: number;
};

type LatePolicy = {
  allowedMinutes: number;
  fineAmount: number;
  notifyManager: boolean;
};

type TimekeepingSettings = {
  shifts: Shift[];
  latePolicy: LatePolicy;
};

type SettingCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

const defaultSettings: TimekeepingSettings = {
  shifts: [
    { id: "ca1", name: "Ca 1", start: "08:00", end: "12:00", wage: 25000 },
    { id: "ca2", name: "Ca 2", start: "12:00", end: "17:00", wage: 25000 },
    { id: "ca3", name: "Ca 3", start: "17:00", end: "22:00", wage: 27000 },
    { id: "ca4", name: "Ca 4", start: "22:00", end: "02:00", wage: 30000 },
  ],
  latePolicy: {
    allowedMinutes: 15,
    fineAmount: 20000,
    notifyManager: true,
  },
};

function SettingCard({ icon, title, description, children }: SettingCardProps) {
  return (
    <section className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_10px_30px_rgba(97,39,25,0.06)] sm:p-6 lg:p-7">
      <div className="mb-5 flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff2f0] text-[#c62828] shadow-sm ring-1 ring-[#f1dad6]">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-[#2f1f1b] sm:text-xl">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#9a7d77]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-sm font-bold text-[#4a332f]">{children}</label>;
}

function clampNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value) + "đ";
}

export default function TimekeepingPage() {
  const [settings, setSettings] = useState<TimekeepingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const snapshot = await getDoc(doc(db, "settings", "timekeeping"));
        if (!mounted) return;

        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<TimekeepingSettings>;
          const loadedSettings: TimekeepingSettings = {
            shifts:
              data.shifts?.length === 4
                ? data.shifts.map((shift, index) => ({
                    id: shift.id || defaultSettings.shifts[index].id,
                    name: shift.name || defaultSettings.shifts[index].name,
                    start: shift.start || defaultSettings.shifts[index].start,
                    end: shift.end || defaultSettings.shifts[index].end,
                    wage: clampNumber(String(shift.wage), defaultSettings.shifts[index].wage),
                  }))
                : defaultSettings.shifts,
            latePolicy: {
              allowedMinutes: clampNumber(String(data.latePolicy?.allowedMinutes ?? defaultSettings.latePolicy.allowedMinutes), defaultSettings.latePolicy.allowedMinutes),
              fineAmount: clampNumber(String(data.latePolicy?.fineAmount ?? defaultSettings.latePolicy.fineAmount), defaultSettings.latePolicy.fineAmount),
              notifyManager: data.latePolicy?.notifyManager ?? defaultSettings.latePolicy.notifyManager,
            },
          };

          setSettings(loadedSettings);
        } else {
          setSettings(defaultSettings);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const summaryItems = useMemo(() => {
    return [
      ...settings.shifts.map((shift) => `${shift.name}: ${shift.start} - ${shift.end} | ${formatMoney(shift.wage)}/giờ`),
      `Phạt đi muộn: ${formatMoney(settings.latePolicy.fineAmount)}`,
      `Cho phép trễ: ${settings.latePolicy.allowedMinutes} phút`,
      settings.latePolicy.notifyManager ? "Thông báo quản lý: Bật" : "Thông báo quản lý: Tắt",
    ];
  }, [settings]);

  function updateShift(index: number, field: keyof Shift, value: string | number) {
    setSettings((current) => {
      const shifts = [...current.shifts];
      shifts[index] = { ...shifts[index], [field]: field === "wage" ? clampNumber(String(value), shifts[index].wage) : value };
      return { ...current, shifts };
    });
  }

  function updateLatePolicy(field: keyof LatePolicy, value: string | number | boolean) {
    setSettings((current) => ({
      ...current,
      latePolicy: {
        ...current.latePolicy,
        [field]: field === "notifyManager" ? Boolean(value) : clampNumber(String(value), current.latePolicy[field as "allowedMinutes" | "fineAmount"]),
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await setDoc(
        doc(db, "settings", "timekeeping"),
        {
          shifts: settings.shifts.map((shift) => ({
            ...shift,
            wage: clampNumber(String(shift.wage), shift.wage),
          })),
          latePolicy: {
            allowedMinutes: clampNumber(String(settings.latePolicy.allowedMinutes), defaultSettings.latePolicy.allowedMinutes),
            fineAmount: clampNumber(String(settings.latePolicy.fineAmount), defaultSettings.latePolicy.fineAmount),
            notifyManager: settings.latePolicy.notifyManager,
          },
        },
        { merge: true },
      );
      setToast("Đã lưu thiết lập chấm công thành công.");
    } catch {
      setToast("Không thể lưu thiết lập. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 rounded-2xl bg-[#1f7a3f] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(31,122,63,0.25)]">
          {toast}
        </div>
      ) : null}

      <section className="rounded-[30px] bg-[#fff9f7] p-4 shadow-[0_12px_40px_rgba(97,39,25,0.05)] ring-1 ring-[#f0dfda] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b08d85]">Thiết lập chấm công</p>
            <h1 className="mt-2 text-[1.9rem] font-black tracking-tight text-[#231714] lg:text-[2.5rem]">Cấu hình ca làm và quy định chấm công</h1>
            <p className="mt-2 max-w-3xl text-sm text-[#9f827c] lg:text-base">
              Dữ liệu được đồng bộ từ Firestore để áp dụng ngay cho 4 ca làm và quy định đi muộn của toàn hệ thống.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setSettings(defaultSettings)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#f0d3cf] bg-white px-4 py-3 text-sm font-bold text-[#7d4a45] transition hover:bg-[#fff4f2]"
            >
              <ShieldAlert className="h-4 w-4" />
              Đưa về mặc định
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c62828] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(198,40,40,0.25)] transition hover:bg-[#a91f1f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Đang lưu..." : "Lưu thiết lập"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="space-y-4 sm:space-y-5">
            <SettingCard
              icon={<Clock className="h-5 w-5" />}
              title="Cấu hình 4 Ca làm"
              description="Thiết lập giờ bắt đầu, giờ kết ca và lương theo giờ riêng cho từng ca làm."
            >
              <div className="space-y-4">
                {settings.shifts.map((shift, index) => (
                  <div key={shift.id} className="rounded-[24px] border border-[#f0e5e2] bg-[#fffdfc] p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#c62828]">{shift.name}</p>
                        <p className="mt-1 text-sm text-[#9a7d77]">Cài đặt riêng cho {shift.name.toLowerCase()}</p>
                      </div>
                      <div className="rounded-full bg-[#fff2f0] px-3 py-1 text-xs font-bold text-[#c62828] ring-1 ring-[#f1dad6]">
                        {formatMoney(shift.wage)}/giờ
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <FieldLabel>Giờ bắt đầu</FieldLabel>
                        <div className="relative">
                          <CalendarClock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c46d5f]" />
                          <input
                            type="time"
                            value={shift.start}
                            onChange={(e) => updateShift(index, "start", e.target.value)}
                            className="h-14 w-full rounded-2xl border border-[#e9dedb] bg-[#fffdfc] pl-12 pr-4 text-[1rem] font-semibold text-[#2f1f1b] outline-none transition focus:border-[#c62828] focus:bg-white focus:ring-4 focus:ring-[#f7d8d4]"
                          />
                        </div>
                      </div>

                      <div>
                        <FieldLabel>Giờ kết thúc</FieldLabel>
                        <div className="relative">
                          <CalendarClock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c46d5f]" />
                          <input
                            type="time"
                            value={shift.end}
                            onChange={(e) => updateShift(index, "end", e.target.value)}
                            className="h-14 w-full rounded-2xl border border-[#e9dedb] bg-[#fffdfc] pl-12 pr-4 text-[1rem] font-semibold text-[#2f1f1b] outline-none transition focus:border-[#c62828] focus:bg-white focus:ring-4 focus:ring-[#f7d8d4]"
                          />
                        </div>
                      </div>

                      <div>
                        <FieldLabel>Mức lương / giờ</FieldLabel>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-[#c46d5f]">₫</span>
                          <input
                            type="number"
                            min={0}
                            step={1000}
                            value={shift.wage}
                            onChange={(e) => updateShift(index, "wage", clampNumber(e.target.value, shift.wage))}
                            className="h-14 w-full rounded-2xl border border-[#e9dedb] bg-[#fffdfc] pl-9 pr-4 text-[1rem] font-semibold text-[#2f1f1b] outline-none transition focus:border-[#c62828] focus:bg-white focus:ring-4 focus:ring-[#f7d8d4]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="rounded-[22px] bg-[#fcf9f8] p-4 ring-1 ring-[#f2e6e3]">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#fff2f0] text-[#c62828]">
                      <Gauge className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2f1f1b]">Lưu ý</p>
                      <p className="mt-1 text-sm leading-6 text-[#9a7d77]">
                        Các giá trị lương và thời gian được lưu trực tiếp lên document `settings/timekeeping` để đồng bộ cho hệ thống chấm công.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SettingCard>

            <SettingCard
              icon={<BellRing className="h-5 w-5" />}
              title="Quy định trễ giờ"
              description="Thiết lập giới hạn trễ và mức phạt khi nhân viên đi muộn."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Cho phép trễ tối đa (phút)</FieldLabel>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={settings.latePolicy.allowedMinutes}
                      onChange={(e) => updateLatePolicy("allowedMinutes", clampNumber(e.target.value, settings.latePolicy.allowedMinutes))}
                      className="h-14 w-full rounded-2xl border border-[#e9dedb] bg-[#fffdfc] px-4 pr-20 text-[1rem] font-semibold text-[#2f1f1b] outline-none transition focus:border-[#c62828] focus:bg-white focus:ring-4 focus:ring-[#f7d8d4]"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#a88c86]">phút</span>
                  </div>
                </div>

                <div>
                  <FieldLabel>Mức phạt đi muộn (VNĐ)</FieldLabel>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-[#c46d5f]">₫</span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={settings.latePolicy.fineAmount}
                      onChange={(e) => updateLatePolicy("fineAmount", clampNumber(e.target.value, settings.latePolicy.fineAmount))}
                      className="h-14 w-full rounded-2xl border border-[#e9dedb] bg-[#fffdfc] pl-9 pr-4 text-[1rem] font-semibold text-[#2f1f1b] outline-none transition focus:border-[#c62828] focus:bg-white focus:ring-4 focus:ring-[#f7d8d4]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-[#f0e5e2] bg-[#fffdfc] p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={settings.latePolicy.notifyManager}
                    onChange={(e) => updateLatePolicy("notifyManager", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#d7c6c2] text-[#c62828] accent-[#c62828]"
                  />
                  <span>
                    <span className="block text-sm font-bold text-[#2f1f1b]">Tự động thông báo cho Quản lý khi có nhân viên đi muộn</span>
                    <span className="mt-1 block text-xs leading-5 text-[#9a7d77]">
                      Khi bật, hệ thống sẽ gửi cảnh báo nội bộ ngay sau khi vượt quá ngưỡng cho phép.
                    </span>
                  </span>
                </label>
              </div>
            </SettingCard>
          </div>
        </div>

        <aside className="space-y-4 sm:space-y-5 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_10px_30px_rgba(97,39,25,0.06)] sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff2f0] text-[#c62828] shadow-sm ring-1 ring-[#f1dad6]">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#2f1f1b]">Tóm tắt thiết lập</h2>
                <p className="mt-1 text-sm leading-6 text-[#9a7d77]">Tóm tắt 4 ca làm và quy định phạt đang được áp dụng.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {summaryItems.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-[#fcf9f8] px-4 py-3 ring-1 ring-[#f2e6e3]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c62828]" />
                  <span className="text-sm font-semibold leading-6 text-[#2f1f1b]">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_10px_30px_rgba(97,39,25,0.06)] sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff2f0] text-[#c62828] shadow-sm ring-1 ring-[#f1dad6]">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#2f1f1b]">Lưu ý vận hành</h2>
                <p className="mt-1 text-sm leading-6 text-[#9a7d77]">Các thiết lập này sẽ ảnh hưởng trực tiếp đến dữ liệu chấm công và tiền lương.</p>
              </div>
            </div>

            <ul className="mt-5 space-y-3 text-sm leading-6 text-[#7d645e]">
              <li className="rounded-2xl bg-[#fcf9f8] p-4 ring-1 ring-[#f2e6e3]">• Mỗi ca có mức lương riêng, hệ thống sẽ dùng đúng giá trị của ca đó khi tính công.</li>
              <li className="rounded-2xl bg-[#fcf9f8] p-4 ring-1 ring-[#f2e6e3]">• Ngưỡng trễ và mức phạt được lưu trong `latePolicy` để dùng chung toàn hệ thống.</li>
              <li className="rounded-2xl bg-[#fcf9f8] p-4 ring-1 ring-[#f2e6e3]">• Nhớ lưu thiết lập sau khi chỉnh sửa để áp dụng cho lần chấm công kế tiếp.</li>
            </ul>
          </section>
        </aside>
      </section>
    </div>
  );
}
