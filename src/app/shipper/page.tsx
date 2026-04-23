"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Navigation2,
  Package2,
  Phone,
  Truck,
  UserRound,
} from "lucide-react";

import { auth, db } from "@/app/lib/firebase";

type OrderDoc = {
  id: string;
  khach_hang?: {
    ten?: string;
    sdt?: string;
    dia_chi?: string;
    ghi_chu?: string;
  };
  danh_sach_mon?: Array<{
    name?: string;
    quantity?: number;
  }>;
  tong_tien?: number;
  trang_thai?: string;
  nguoi_giao?: string;
  thoi_gian_tao?: {
    toDate?: () => Date;
  };
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: OrderDoc["thoi_gian_tao"]) {
  if (!value?.toDate) return "Chưa có thời gian";
  return value.toDate().toLocaleString("vi-VN");
}

function OrderCard({ order, onComplete }: { order: OrderDoc; onComplete: (orderId: string) => Promise<void> }) {
  const itemsCount = order.danh_sach_mon?.reduce((sum, item) => sum + (item.quantity ?? 1), 0) ?? 0;
  const customerPhone = order.khach_hang?.sdt ?? "";

  return (
    <article className="overflow-hidden rounded-[28px] border border-[#f4e3df] bg-white shadow-[0_16px_50px_rgba(17,24,39,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(17,24,39,0.12)]">
      <div className="bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#fb923c] px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-white/90">
              <Truck className="h-3.5 w-3.5" />
              Đang giao
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight">{order.id}</h2>
            <p className="mt-1 text-sm text-white/85">Cập nhật lúc: {formatDate(order.thoi_gian_tao)}</p>
          </div>

          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
            <Package2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr] sm:items-stretch">
          <div className="rounded-[22px] bg-[#fff7f5] p-4 ring-1 ring-[#f4e3df]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#9b756f]">
              <UserRound className="h-4 w-4 text-[#dc2626]" />
              Khách hàng
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-2xl font-black tracking-tight text-[#3c2b28]">{order.khach_hang?.ten ?? "Khách hàng"}</p>
              <a
                href={`tel:${customerPhone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 text-lg font-semibold text-[#5b4541] underline-offset-4 hover:underline"
              >
                <Phone className="h-4 w-4 text-[#dc2626]" />
                {customerPhone || "Chưa có số điện thoại"}
              </a>
            </div>
          </div>

          <div className="rounded-[22px] bg-[#dc2626] p-4 text-white shadow-[0_12px_30px_rgba(220,38,38,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70">Số tiền cần thu</div>
                <p className="mt-3 text-4xl font-black tracking-tight">{formatCurrency(order.tong_tien ?? 0)}</p>
              </div>
              <Phone className="h-8 w-8 text-white/80" />
            </div>
            <div className="mt-4 text-xs font-semibold text-white/75">
              Món trong đơn: {itemsCount}
            </div>
          </div>
        </div>

        <div className="rounded-[22px] bg-[#fffaf9] p-4 ring-1 ring-[#f4e3df]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#9b756f]">
            <MapPin className="h-4 w-4 text-[#dc2626]" />
            Địa chỉ giao hàng
          </div>
          <p className="mt-3 text-[1.05rem] font-bold leading-relaxed text-[#3f2f2c] sm:text-[1.15rem]">
            {order.khach_hang?.dia_chi || "Chưa có địa chỉ"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#8b6f6a]">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium ring-1 ring-[#eadbd8]">
              <Navigation2 className="h-3.5 w-3.5 text-[#dc2626]" />
              {order.id}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium ring-1 ring-[#eadbd8]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#dc2626]" />
              {order.trang_thai ?? "Đang giao"}
            </span>
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-4 ring-1 ring-[#f4e3df]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b756f]">Ghi chú</div>
          </div>
          <p className="mt-3 text-[1rem] leading-relaxed text-[#4e3935]">
            {order.khach_hang?.ghi_chu || "Không có ghi chú"}
          </p>
        </div>

        <div className="rounded-[22px] bg-white p-4 ring-1 ring-[#f4e3df]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b756f]">Danh sách món</div>
            <span className="rounded-full bg-[#fff1f0] px-3 py-1 text-xs font-bold text-[#dc2626] ring-1 ring-[#fecaca]">
              {itemsCount} món
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {(order.danh_sach_mon ?? []).map((item, index) => (
              <div key={`${item.name ?? index}-${index}`} className="flex items-start justify-between gap-4 border-b border-[#f5e8e6] pb-3 last:border-b-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[1.02rem] font-semibold text-[#4e3935]">
                    {item.name ?? "Món ăn"}
                    {item.quantity && item.quantity > 1 ? ` x${item.quantity}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-[#a38c87]">Món {index + 1}</p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#d7b5af]" />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onComplete(order.id)}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#dc2626] px-4 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(220,38,38,0.22)] transition hover:bg-[#b91c1c] active:scale-[0.99] sm:min-h-[60px]"
        >
          <CheckCircle2 className="h-5 w-5" />
          Đã giao xong
        </button>
      </div>
    </article>
  );
}

export default function ShipperTransitPage() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentUserLabel = auth.currentUser?.displayName || auth.currentUser?.uid || "Shipper";

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("thoi_gian_tao", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as OrderDoc));
        setOrders(
          items.filter((order) => {
            const assignedTo = String(order.nguoi_giao ?? "");
            return order.trang_thai === "Đang giao" && (!assignedTo || assignedTo === currentUserLabel || assignedTo === auth.currentUser?.uid);
          }),
        );
      },
      (snapshotError) => setError(snapshotError.message || "Không thể tải đơn hàng đang giao."),
    );
  }, [currentUserLabel]);

  async function handleComplete(orderId: string) {
    setError(null);
    setMessage(null);

    try {
      await updateDoc(doc(db, "orders", orderId), {
        trang_thai: "Hoàn thành",
      });
      setMessage("Chúc mừng! Đơn hàng đã được cập nhật hoàn thành.");
    } catch (completeError) {
      setError(completeError instanceof Error ? completeError.message : "Không thể cập nhật trạng thái đơn hàng.");
    }
  }

  const totalOrders = orders.length;

  return (
    <div className="space-y-6 pb-4">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#fff7f5] via-white to-[#fff1ee] p-5 shadow-[0_16px_50px_rgba(17,24,39,0.05)] ring-1 ring-[#f3e1dd] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1f0] px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-[#dc2626] ring-1 ring-[#fecaca]">
              <Bell className="h-3.5 w-3.5" />
              Trang điều phối
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#3f2f2c] sm:text-5xl">Đơn hàng đang giao</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7f625d] sm:text-base">
              Danh sách đơn được lọc tự động. Khi bấm “Đã giao xong”, trạng thái sẽ chuyển sang Hoàn thành và đơn sẽ tự biến mất khỏi màn hình.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-3xl bg-white p-4 ring-1 ring-[#f2dfdb]">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b756f]">Tổng đơn</p>
              <p className="mt-2 text-3xl font-black text-[#dc2626]">{totalOrders}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 ring-1 ring-[#f2dfdb]">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b756f]">Tài khoản</p>
              <p className="mt-2 truncate text-lg font-black text-[#3f2f2c]">{currentUserLabel}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-[#f2d1d1] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#b42318]">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-[#d9f0df] bg-[#f3fbf5] px-4 py-3 text-sm font-medium text-[#1f7a39]">{message}</div> : null}

      {orders.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[#eadbd7] bg-white px-5 py-12 text-center text-[#8a6d68] shadow-[0_16px_50px_rgba(17,24,39,0.05)]">
          Hiện chưa có đơn nào đang giao cho bạn.
        </div>
      ) : (
        <section className="grid gap-5 md:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onComplete={handleComplete} />
          ))}
        </section>
      )}
    </div>
  );
}
