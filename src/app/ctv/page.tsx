"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { ChartBar, Coins, ShoppingBag, UserCircle } from "lucide-react";

import { db } from "@/app/lib/firebase";

type FirestoreOrder = {
  id: string;
  tong_tien?: number;
  trang_thai?: string;
  nguoi_tao?: string;
};

const CTV_UID = "ctv-demo-uid";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CtvPage() {
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
      (snapshotError) => setError(snapshotError.message || "Đang tổng hợp dữ liệu hoa hồng..."),
    );
  }, []);

  const completedOrders = useMemo(
    () => orders.filter((order) => order.trang_thai === "Hoàn tất"),
    [orders],
  );

  const totalRevenue = useMemo(
    () => completedOrders.reduce((sum, order) => sum + Number(order.tong_tien ?? 0), 0),
    [completedOrders],
  );

  const commission = useMemo(() => totalRevenue * 0.1, [totalRevenue]);

  const stats = [
    {
      title: "Tổng thu nhập",
      value: formatCurrency(totalRevenue + commission),
      subtitle: "Tổng doanh thu và hoa hồng tạm tính",
      icon: ChartBar,
      iconClassName: "text-[#c62828]",
      cardClassName: "bg-white",
    },
    {
      title: "Hoa hồng",
      value: formatCurrency(commission),
      subtitle: "10% trên tổng doanh thu hoàn thành",
      icon: Coins,
      iconClassName: "text-[#c62828]",
      cardClassName: "bg-gradient-to-br from-[#c62828] to-[#dc2626] text-white",
    },
    {
      title: "Đơn hoàn tất",
      value: String(completedOrders.length),
      subtitle: "Đơn đã hoàn tất và thanh toán",
      icon: ShoppingBag,
      iconClassName: "text-[#c62828]",
      cardClassName: "bg-white",
    },
  ];

  return (
    <section className="space-y-6 lg:space-y-8">
      <header className="flex items-center justify-between gap-4 rounded-[28px] bg-white px-5 py-5 shadow-sm ring-1 ring-black/5 lg:px-8 lg:py-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#b4534c]">Tổng quan CTV</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#3f2723] lg:text-4xl">Xin chào, CTV</h1>
          <p className="max-w-xl text-sm text-[#8d6a64] lg:text-base">
            Đang tổng hợp dữ liệu hoa hồng và thu nhập từ các đơn đã hoàn tất.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-full bg-[#fff7f5] px-3 py-2 shadow-inner ring-1 ring-[#f0d7d2]">
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#dc2626] to-[#fb7185] text-white shadow-sm">
            <UserCircle className="h-7 w-7" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-[#4b2d29]">CTV</div>
            <div className="text-xs text-[#9a746d]">Đang hoạt động</div>
          </div>
        </div>
      </header>

      {error ? <div className="rounded-2xl border border-[#f2d1d1] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#b42318]">{error}</div> : null}

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        {stats.map((item, index) => {
          const Icon = item.icon;
          const isHighlighted = index === 1;
          const isWhiteText = item.cardClassName.includes("text-white");

          return (
            <article
              key={item.title}
              className={`rounded-[30px] p-5 shadow-[0_16px_40px_rgba(97,39,25,0.08)] ring-1 ring-black/5 lg:p-6 ${item.cardClassName}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${isWhiteText ? "text-white/80" : "text-[#9c6a62]"}`}>{item.title}</p>
                  <div className={`text-[2.2rem] font-black tracking-tight lg:text-[3.2rem] ${isWhiteText ? "text-white" : "text-[#3d231f]"}`}>{item.value}</div>
                  <p className={`text-sm ${isWhiteText ? "text-white/80" : "text-[#8f6f68]"}`}>{item.subtitle}</p>
                </div>

                <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${isWhiteText ? "bg-white/10 ring-1 ring-white/20" : isHighlighted ? "bg-white/20 text-white" : "bg-[#f8f0ee]"}`}>
                  <Icon className={`h-7 w-7 ${item.iconClassName}`} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="rounded-[28px] border border-[#efe2df] bg-white p-5 shadow-sm ring-1 ring-black/5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#3f2723]">Tình trạng đơn hàng của bạn</h2>
            <p className="mt-1 text-sm text-[#8d6a64]">Chỉ tính các đơn do CTV này tạo ra.</p>
          </div>
          <div className="rounded-full bg-[#f1fbf4] px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            {completedOrders.length} đơn hoàn thành
          </div>
        </div>
      </div>
    </section>
  );
}
