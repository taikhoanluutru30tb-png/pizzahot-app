"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
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

import { db } from "@/app/lib/firebase";

type TimekeepingRecord = {
  id: string;
  uid: string;
  ngay: string;
  gio_bat_dau?: string;
  gio_ket_thuc?: string;
};

const STAFF_UID = "staff-demo-uid";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateKey(date: Date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function isSameDayRecord(record: TimekeepingRecord, uid: string, ngay: string) {
  return record.uid === uid && record.ngay === ngay;
}

export default function StaffAttendancePage() {
  const [now, setNow] = useState(() => new Date());
  const [records, setRecords] = useState<TimekeepingRecord[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "timekeeping"), orderBy("ngay", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as TimekeepingRecord));
        setRecords(items.filter((record) => record.uid === STAFF_UID));
      },
      (snapshotError) => setError(snapshotError.message || "Không thể tải lịch sử chấm công."),
    );
  }, []);

  const today = useMemo(() => formatDateKey(now), [now]);
  const todayLabel = useMemo(() => formatDisplayDate(now), [now]);
  const liveClock = useMemo(() => formatTime(now), [now]);
  const todayRecord = useMemo(() => records.find((record) => isSameDayRecord(record, STAFF_UID, today)), [records, today]);
  const hasCheckedInToday = Boolean(todayRecord?.gio_bat_dau);
  const hasCheckedOutToday = Boolean(todayRecord?.gio_ket_thuc);

  async function handleCheckIn(event: FormEvent<HTMLButtonElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (hasCheckedInToday) {
      setError("Hôm nay bạn đã check-in rồi.");
      return;
    }

    try {
      await addDoc(collection(db, "timekeeping"), {
        uid: STAFF_UID,
        ngay: today,
        gio_bat_dau: liveClock,
      });
      setMessage("Check-in thành công.");
    } catch (checkInError) {
      setError(checkInError instanceof Error ? checkInError.message : "Không thể check-in.");
    }
  }

  async function handleCheckOut(event: FormEvent<HTMLButtonElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!todayRecord?.gio_bat_dau) {
      setError("Bạn cần check-in trước khi check-out.");
      return;
    }

    if (todayRecord.gio_ket_thuc) {
      setError("Hôm nay bạn đã check-out rồi.");
      return;
    }

    try {
      await updateDoc({ id: todayRecord.id } as never, {
        gio_ket_thuc: liveClock,
      });
      setMessage("Check-out thành công.");
    } catch (checkOutError) {
      setError(checkOutError instanceof Error ? checkOutError.message : "Không thể check-out.");
    }
  }

  const history = useMemo(() => {
    return [...records].sort((a, b) => b.ngay.localeCompare(a.ngay));
  }, [records]);

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

      {error ? <div className="rounded-2xl border border-[#f2d1d1] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#b42318]">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-[#d9f0df] bg-[#f3fbf5] px-4 py-3 text-sm font-medium text-[#1f7a39]">{message}</div> : null}

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
            onClick={handleCheckIn}
            disabled={hasCheckedInToday}
            className="group flex w-full items-center justify-center gap-4 rounded-[24px] bg-[#dc2626] px-5 py-5 text-white shadow-lg shadow-[#dc2626]/20 transition hover:-translate-y-0.5 hover:bg-[#b91c1c] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[112px] sm:px-6"
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
            onClick={handleCheckOut}
            disabled={!hasCheckedInToday || hasCheckedOutToday}
            className="group flex w-full items-center justify-center gap-4 rounded-[24px] bg-white px-5 py-5 text-[#4b3a37] shadow-[0_12px_30px_rgba(17,24,39,0.08)] ring-1 ring-[#f0e3e0] transition hover:-translate-y-0.5 hover:bg-[#fff7f6] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[112px] sm:px-6"
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
            <h2 className="text-xl font-bold text-[#3f2f2c] sm:text-2xl">Lịch sử chấm công</h2>
            <p className="mt-1 text-sm text-[#8a6d68]">Các lần check-in / check-out được lắng nghe realtime từ Firestore</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-[#fff7f5] px-3 py-2 text-xs font-medium text-[#8a6d68] sm:flex">
            <MapPin className="h-4 w-4 text-[#dc2626]" />
            Nhân viên: {STAFF_UID}
          </div>
        </div>

        <div className="space-y-3">
          {history.map((record) => {
            const isCheckedIn = Boolean(record.gio_bat_dau);
            return (
              <article key={record.id} className="flex items-center gap-4 rounded-2xl bg-[#fffaf9] px-4 py-4 ring-1 ring-[#f4e9e7]">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${isCheckedIn ? "bg-[#ecfdf3] text-[#16a34a] ring-1 ring-[#bbf7d0]" : "bg-[#fff1f2] text-[#dc2626] ring-1 ring-[#fecdd3]"}`}>
                  {isCheckedIn ? <LogIn className="h-5 w-5" /> : <LogOut className="h-5 w-5" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-base font-bold text-[#3f2f2c]">{record.ngay}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#8a6d68] ring-1 ring-[#eadedb]">
                      <Clock3 className="h-3.5 w-3.5" />
                      Vào: {record.gio_bat_dau ?? "---"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#8a6d68] ring-1 ring-[#eadedb]">
                      <Clock3 className="h-3.5 w-3.5" />
                      Ra: {record.gio_ket_thuc ?? "---"}
                    </span>
                  </div>
                </div>

                <CheckCircle2 className={`h-5 w-5 shrink-0 ${isCheckedIn ? "text-[#16a34a]" : "text-[#dc2626]"}`} />
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
