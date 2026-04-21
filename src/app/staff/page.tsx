"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  MapPin,
  ShieldCheck,
  SunMedium,
  TimerReset,
} from "lucide-react";

type AttendanceAction = "check-in" | "check-out";

type AttendanceRecord = {
  id: string;
  action: AttendanceAction;
  time: string;
  note: string;
};

const SAMPLE_HISTORY: AttendanceRecord[] = [
  { id: "1", action: "check-in", time: "07:58:12", note: "Vào ca đúng giờ" },
  { id: "2", action: "check-out", time: "12:01:40", note: "Nghỉ trưa" },
  { id: "3", action: "check-in", time: "13:02:10", note: "Quay lại ca làm" },
];

const vietnameseDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatRealtimeClock(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function StaffAttendancePage() {
  const [now, setNow] = useState(() => new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>(SAMPLE_HISTORY);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const todayLabel = useMemo(() => vietnameseDateFormatter.format(now), [now]);
  const liveClock = useMemo(() => formatRealtimeClock(now), [now]);

  const handleAttendance = (action: AttendanceAction) => {
    const time = timeFormatter.format(new Date());
    const label = action === "check-in" ? "Check-in" : "Check-out";

    setRecords((current) => [
      {
        id: `${Date.now()}-${action}`,
        action,
        time,
        note: `${label} lúc ${time}`,
      },
      ...current,
    ]);
  };

  return (
    <div className="space-y-6 pb-6">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#b91c1c] via-[#dc2626] to-[#f97316] p-5 text-white shadow-[0_24px_60px_rgba(82,28,20,0.16)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90">
              <Clock3 className="h-3.5 w-3.5" />
              Thời gian hiện tại
            </div>
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl">{liveClock}</h1>
            <p className="mt-3 text-sm font-medium text-white/90 sm:text-base">{todayLabel}</p>
          </div>

          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-white/95 ring-1 ring-white/20 sm:h-14 sm:w-14">
            <TimerReset className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-2xl font-bold text-[#3f2f2c]">Chấm công</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#fff1f0] px-3 py-1 text-xs font-semibold text-[#dc2626] ring-1 ring-[#fecaca]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Hôm nay
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <button
            type="button"
            onClick={() => handleAttendance("check-in")}
            className="group flex w-full items-center justify-center gap-4 rounded-[24px] bg-[#dc2626] px-5 py-5 text-white shadow-lg shadow-[#dc2626]/20 transition hover:-translate-y-0.5 hover:bg-[#b91c1c] active:translate-y-0 sm:min-h-[112px] sm:px-6"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20 transition group-hover:bg-white/20 sm:h-16 sm:w-16">
              <LogIn className="h-7 w-7 sm:h-8 sm:w-8" />
            </span>
            <span className="text-center">
              <span className="block text-xs font-bold uppercase tracking-[0.24em] text-white/75">Xác nhận</span>
              <span className="mt-1 block text-2xl font-black sm:text-3xl">Check-in</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleAttendance("check-out")}
            className="group flex w-full items-center justify-center gap-4 rounded-[24px] bg-white px-5 py-5 text-[#4b3a37] shadow-[0_12px_30px_rgba(17,24,39,0.08)] ring-1 ring-[#f0e3e0] transition hover:-translate-y-0.5 hover:bg-[#fff7f6] active:translate-y-0 sm:min-h-[112px] sm:px-6"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#fff1f0] text-[#dc2626] ring-1 ring-[#fecaca] transition group-hover:bg-[#ffe4e6] sm:h-16 sm:w-16">
              <LogOut className="h-7 w-7 sm:h-8 sm:w-8" />
            </span>
            <span className="text-center">
              <span className="block text-xs font-bold uppercase tracking-[0.24em] text-[#a18a86]">Kết thúc</span>
              <span className="mt-1 block text-2xl font-black sm:text-3xl">Check-out</span>
            </span>
          </button>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-4 shadow-[0_12px_40px_rgba(17,24,39,0.06)] ring-1 ring-[#f4e9e7] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#3f2f2c] sm:text-2xl">Lịch sử chấm công hôm nay</h2>
            <p className="mt-1 text-sm text-[#8a6d68]">Các lần check-in / check-out được ghi nhận trong ngày</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-[#fff7f5] px-3 py-2 text-xs font-medium text-[#8a6d68] sm:flex">
            <MapPin className="h-4 w-4 text-[#dc2626]" />
            Chi nhánh Quận 1
          </div>
        </div>

        <div className="space-y-3">
          {records.map((record) => {
            const isCheckIn = record.action === "check-in";
            return (
              <article
                key={record.id}
                className="flex items-center gap-4 rounded-2xl bg-[#fffaf9] px-4 py-4 ring-1 ring-[#f4e9e7]"
              >
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${isCheckIn ? "bg-[#ecfdf3] text-[#16a34a] ring-1 ring-[#bbf7d0]" : "bg-[#fff1f2] text-[#dc2626] ring-1 ring-[#fecdd3]"}`}
                >
                  {isCheckIn ? <LogIn className="h-5 w-5" /> : <LogOut className="h-5 w-5" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-base font-bold text-[#3f2f2c]">{isCheckIn ? "Check-in" : "Check-out"}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#8a6d68] ring-1 ring-[#eadedb]">
                      <Clock3 className="h-3.5 w-3.5" />
                      {record.time}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-[#8a6d68]">{record.note}</p>
                </div>

                <CheckCircle2 className={`h-5 w-5 shrink-0 ${isCheckIn ? "text-[#16a34a]" : "text-[#dc2626]"}`} />
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[24px] border-l-4 border-l-[#dc2626] bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-[#f4e9e7]">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#8a6d68]">
            <SunMedium className="h-4 w-4 text-[#dc2626]" />
            Ca làm hiện tại
          </div>
          <p className="mt-3 text-xl font-black text-[#3f2f2c]">Ca chiều (Chính thức)</p>
          <p className="mt-2 text-sm text-[#8a6d68]">14:00 - 22:00</p>
        </div>

        <div className="rounded-[24px] border-l-4 border-l-[#f59e0b] bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-[#f4e9e7]">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#8a6d68]">
            <ShieldCheck className="h-4 w-4 text-[#f59e0b]" />
            Trạng thái
          </div>
          <p className="mt-3 text-xl font-black text-[#3f2f2c]">Sẵn sàng chấm công</p>
          <p className="mt-2 text-sm text-[#8a6d68]">Nút lớn, dễ bấm trên mobile</p>
        </div>
      </section>
    </div>
  );
}
