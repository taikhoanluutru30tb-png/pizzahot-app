"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  Search,
  SquareDashedMousePointer,
  Truck,
  XCircle,
} from "lucide-react";

type DeliveryStatus = "success" | "failed";

type DeliveryRecord = {
  id: string;
  orderCode: string;
  deliveredAt: string;
  amount: string;
  status: DeliveryStatus;
  location?: string;
};

const DELIVERY_HISTORY: DeliveryRecord[] = [
  {
    id: "1",
    orderCode: "#ORD-9921",
    deliveredAt: "14:20 • 21/04/2026",
    amount: "320.000đ",
    status: "success",
    location: "Q.1 · 2.5km",
  },
  {
    id: "2",
    orderCode: "#ORD-9845",
    deliveredAt: "13:45 • 21/04/2026",
    amount: "1.450.000đ",
    status: "success",
    location: "Q.3 · 4.1km",
  },
  {
    id: "3",
    orderCode: "#ORD-9801",
    deliveredAt: "13:10 • 21/04/2026",
    amount: "85.000đ",
    status: "failed",
    location: "Q.7 · 1.2km",
  },
  {
    id: "4",
    orderCode: "#ORD-9778",
    deliveredAt: "11:55 • 21/04/2026",
    amount: "620.000đ",
    status: "success",
    location: "Thủ Đức · 7.4km",
  },
  {
    id: "5",
    orderCode: "#ORD-9712",
    deliveredAt: "10:30 • 21/04/2026",
    amount: "240.000đ",
    status: "failed",
    location: "Q.Bình Thạnh · 3.1km",
  },
];

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const isSuccess = status === "success";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${isSuccess ? "bg-[#e6f6ee] text-[#0f7a45] ring-1 ring-[#c3ebd3]" : "bg-[#feecec] text-[#b42318] ring-1 ring-[#fecaca]"}`}
    >
      {isSuccess ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {isSuccess ? "Thành công" : "Thất bại"}
    </span>
  );
}

function MobileCard({ record }: { record: DeliveryRecord }) {
  return (
    <article className="rounded-[22px] border border-[#f0dfdb] bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#9d726b]">
            <Truck className="h-4 w-4 text-[#dc2626]" />
            Mã đơn
          </div>
          <p className="mt-2 truncate text-xl font-black tracking-tight text-[#3f2f2c]">{record.orderCode}</p>
        </div>
        <StatusBadge status={record.status} />
      </div>

      <div className="mt-4 grid gap-3 rounded-[18px] bg-[#fff8f6] p-4 ring-1 ring-[#f5e6e2]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-[#8a6d68]">
            <Clock3 className="h-4 w-4 text-[#dc2626]" />
            Thời gian
          </div>
          <p className="text-right text-sm font-semibold text-[#4f342f]">{record.deliveredAt}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-[#8a6d68]">
            <ArrowUpRight className="h-4 w-4 text-[#dc2626]" />
            Số tiền
          </div>
          <p className="text-right text-xl font-black text-[#dc2626]">{record.amount}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-[#8a6d68]">
            <CalendarDays className="h-4 w-4 text-[#dc2626]" />
            Khu vực
          </div>
          <p className="text-right text-sm font-semibold text-[#4f342f]">{record.location ?? "-"}</p>
        </div>
      </div>
    </article>
  );
}

export default function ShipperReportPage() {
  const [query, setQuery] = useState("");

  const filteredRecords = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return DELIVERY_HISTORY;

    return DELIVERY_HISTORY.filter((record) => {
      return [record.orderCode, record.deliveredAt, record.amount, record.location, record.status === "success" ? "thành công" : "thất bại"].some((value) =>
        value?.toLowerCase().includes(keyword),
      );
    });
  }, [query]);

  const successCount = DELIVERY_HISTORY.filter((item) => item.status === "success").length;
  const failedCount = DELIVERY_HISTORY.length - successCount;

  return (
    <div className="space-y-6 pb-4">
      <section className="overflow-hidden rounded-[32px] border border-[#f1dfda] bg-gradient-to-br from-[#fff7f5] via-white to-[#fff1ee] p-5 shadow-[0_16px_50px_rgba(17,24,39,0.05)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1f0] px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-[#dc2626] ring-1 ring-[#fecaca]">
              <SquareDashedMousePointer className="h-3.5 w-3.5" />
              Shipper report
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#3f2f2c] sm:text-5xl">Báo cáo đơn hàng đã giao</h1>
            <p className="mt-3 text-sm leading-6 text-[#7f625d] sm:text-base">
              Xem lịch sử giao hàng theo dạng bảng trên màn hình lớn, và tự động chuyển sang card xếp dọc trên mobile để dễ cuộn, dễ đọc, không bị tràn màn hình.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-3xl bg-white p-4 ring-1 ring-[#f2dfdb]">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b756f]">Thành công</p>
              <p className="mt-2 text-3xl font-black text-[#0f7a45]">{successCount}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 ring-1 ring-[#f2dfdb]">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b756f]">Thất bại</p>
              <p className="mt-2 text-3xl font-black text-[#b42318]">{failedCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-[24px] bg-white p-4 ring-1 ring-[#f2dfdb] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b756f]">Gợi ý hiển thị</div>
            <p className="mt-1 text-sm text-[#7f625d]">Table ở desktop, Card ở mobile để thao tác nhanh hơn.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-[#fff7f5] px-3 py-2 text-sm text-[#8a6d68] ring-1 ring-[#f2dfdb]">
            <Filter className="h-4 w-4 text-[#dc2626]" />
            <span>{filteredRecords.length} kết quả</span>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#f1dfda] bg-white p-4 shadow-[0_16px_50px_rgba(17,24,39,0.05)] sm:p-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#3f2f2c]">Lịch sử giao hàng</h2>
            <p className="mt-1 text-sm text-[#7f625d]">Mã đơn, thời gian, số tiền và trạng thái giao hàng.</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:max-w-xl sm:flex-row">
            <label className="flex min-h-12 flex-1 items-center gap-2 rounded-2xl bg-[#fff8f6] px-4 ring-1 ring-[#f1dfda]">
              <Search className="h-4 w-4 shrink-0 text-[#dc2626]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm mã đơn, thời gian, số tiền..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#b59a94]"
              />
            </label>

            <div className="flex items-center justify-center rounded-2xl bg-[#fff8f6] px-4 py-3 text-sm font-semibold text-[#7f625d] ring-1 ring-[#f1dfda]">
              {filteredRecords.length} / {DELIVERY_HISTORY.length}
            </div>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-[24px] border border-[#f2e2de] lg:block">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#fff8f6] text-xs font-bold uppercase tracking-[0.22em] text-[#9b756f]">
              <tr>
                <th className="px-5 py-4">Mã đơn</th>
                <th className="px-5 py-4">Thời gian</th>
                <th className="px-5 py-4">Số tiền</th>
                <th className="px-5 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-t border-[#f5e8e5] transition hover:bg-[#fffaf9]">
                  <td className="px-5 py-4">
                    <div className="font-black text-[#3f2f2c]">{record.orderCode}</div>
                    <div className="mt-1 text-xs text-[#a38c87]">{record.location ?? "-"}</div>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-[#5c4340]">{record.deliveredAt}</td>
                  <td className="px-5 py-4 text-lg font-black text-[#dc2626]">{record.amount}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecords.length === 0 ? (
            <div className="border-t border-[#f5e8e5] px-5 py-10 text-center text-sm text-[#8a6d68]">Không tìm thấy đơn phù hợp.</div>
          ) : null}
        </div>

        <div className="space-y-3 lg:hidden">
          {filteredRecords.map((record) => (
            <MobileCard key={record.id} record={record} />
          ))}
          {filteredRecords.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[#e8d2cd] bg-[#fff8f6] px-4 py-8 text-center text-sm text-[#8a6d68]">
              Không tìm thấy đơn phù hợp.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
