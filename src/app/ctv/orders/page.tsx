"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";

import { db } from "@/app/lib/firebase";

type FirestoreOrder = {
  id: string;
  khach_hang?: {
    ten?: string;
  };
  tong_tien?: number;
  trang_thai?: string;
  nguoi_tao?: string;
  thoi_gian_tao?: {
    toDate?: () => Date;
  };
};

type OrderStatus = string;

const CTV_UID = "ctv-demo-uid";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value?: FirestoreOrder["thoi_gian_tao"]) {
  if (!value?.toDate) return "Chưa có thời gian";
  return value.toDate().toLocaleString("vi-VN");
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<string, string> = {
    "Chốt thành công": "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "Đã thanh toán": "bg-sky-50 text-sky-700 ring-sky-200",
    "Hoàn tất": "bg-violet-50 text-violet-700 ring-violet-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ring-1 ${styles[status] ?? "bg-slate-50 text-slate-700 ring-slate-200"}`}>
      {status}
    </span>
  );
}

export default function CtvOrdersPage() {
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("nguoi_tao", "==", CTV_UID),
      orderBy("thoi_gian_tao", "desc"),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as FirestoreOrder));
        setOrders(items);
      },
      (snapshotError) => setError(snapshotError.message || "Không thể tải dữ liệu đơn hàng."),
    );
  }, []);

  const completedOrders = useMemo(
    () => orders.filter((order) => order.trang_thai === "Hoàn thành"),
    [orders],
  );

  const totals = useMemo(() => {
    const completed = completedOrders.reduce(
      (acc, order) => {
        const amount = Number(order.tong_tien ?? 0);
        acc.revenue += amount;
        acc.count += 1;
        acc.commission += amount * 0.1;
        return acc;
      },
      { revenue: 0, count: 0, commission: 0 },
    );

    return completed;
  }, [completedOrders]);

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-4 text-[#241615] sm:space-y-5 sm:px-5 lg:px-6">
      <section className="rounded-[28px] bg-gradient-to-br from-[#fff8f6] via-white to-[#fffdfc] p-5 shadow-[0_12px_32px_rgba(97,39,25,0.06)] ring-1 ring-[#f0dfda] sm:p-6">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#b18a83]">CTV / Đơn hàng của tôi</p>
          <h1 className="text-[1.8rem] font-black tracking-tight text-[#241615] sm:text-[2.1rem]">Danh sách đơn hàng thực tế</h1>
          <p className="max-w-2xl text-sm leading-6 text-[#987b75] sm:text-base">
            Chỉ hiển thị đơn do CTV này tạo ra. Dữ liệu được lắng nghe realtime từ Firestore collection <span className="font-semibold text-[#6f5752]">orders</span>.
          </p>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-[#f2d1d1] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#b42318]">{error}</div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[20px] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(97,39,25,0.04)] ring-1 ring-[#f0e3df]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a88d86]">Đơn đã chốt</p>
            <p className="mt-2 text-2xl font-black text-[#c62828]">{totals.count}</p>
          </div>
          <div className="rounded-[20px] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(97,39,25,0.04)] ring-1 ring-[#f0e3df]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a88d86]">Tổng doanh thu</p>
            <p className="mt-2 text-2xl font-black text-[#c62828]">{formatCurrency(totals.revenue)}</p>
          </div>
          <div className="rounded-[20px] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(97,39,25,0.04)] ring-1 ring-[#f0e3df]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a88d86]">Hoa hồng 10%</p>
            <p className="mt-2 text-2xl font-black text-emerald-600">{formatCurrency(totals.commission)}</p>
          </div>
          <div className="rounded-[20px] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(97,39,25,0.04)] ring-1 ring-[#f0e3df]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a88d86]">UID</p>
            <p className="mt-2 truncate text-sm font-bold text-[#3f2723]">{CTV_UID}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#eadbd7] bg-white px-4 py-10 text-center text-sm text-[#9a7d77] shadow-[0_10px_28px_rgba(97,39,25,0.05)]">
            Chưa có đơn hàng nào được tạo bởi CTV này.
          </div>
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className="rounded-[24px] border border-[#efe2df] bg-white p-4 shadow-[0_10px_28px_rgba(97,39,25,0.05)] transition active:scale-[0.99] sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a98b84]">{order.id}</p>
                  <h2 className="text-[1.08rem] font-extrabold tracking-tight text-[#251714] sm:text-[1.12rem]">
                    {order.khach_hang?.ten ?? "Khách hàng"}
                  </h2>
                  <p className="text-sm font-medium text-[#9d7f79]">{formatDateTime(order.thoi_gian_tao)}</p>
                </div>

                <StatusBadge status={order.trang_thai ?? "Chưa xác định"} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[18px] bg-[#fbf7f6] px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a78b85]">Tổng bill</p>
                  <p className="mt-1 text-[1.05rem] font-black text-[#c62828]">
                    {formatCurrency(Number(order.tong_tien ?? 0))}
                  </p>
                </div>

                <div className="rounded-[18px] bg-[#f1fbf4] px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Tiền hoa hồng</p>
                  <p className="mt-1 text-[1.05rem] font-black text-emerald-600">
                    {formatCurrency(Number(order.tong_tien ?? 0) * 0.1)}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
