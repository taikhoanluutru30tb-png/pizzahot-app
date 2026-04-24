"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
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
  Loader2,
} from "lucide-react";

import { auth, db } from "@/app/lib/firebase";
import { updateOrder, type OrderDoc as ShipperOrderDoc } from "@/app/lib/order-workflow";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: ShipperOrderDoc["thoi_gian_tao"]) {
  if (!value) return "Chưa có thời gian";
  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toLocaleString("vi-VN");
  }
  if (typeof value === "object" && value !== null && "seconds" in value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000).toLocaleString("vi-VN");
  }
  return "Chưa có thời gian";
}

function getItemName(item: NonNullable<ShipperOrderDoc["danh_sach_mon"]>[number]) {
  return item.ten_mon || item.name || "Món ăn";
}

function getItemQuantity(item: NonNullable<ShipperOrderDoc["danh_sach_mon"]>[number]) {
  return item.so_luong ?? item.quantity ?? 1;
}

function OrderCard({
  order,
  onComplete,
  loading,
}: {
  order: ShipperOrderDoc;
  onComplete: (orderId: string) => Promise<void>;
  loading: boolean;
}) {
  const itemsCount = order.danh_sach_mon?.reduce((sum, item) => sum + getItemQuantity(item), 0) ?? 0;
  const customerPhone = order.khach_hang?.sdt ?? "";

  return (
    <article className="overflow-hidden rounded-[28px] border border-[#f4e3df] bg-white shadow-[0_16px_50px_rgba(17,24,39,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(17,24,39,0.12)]">
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-500 px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-white/90">
              <Truck className="h-3.5 w-3.5" />
              Đang giao hàng
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight">{order.id.replace(/\D/g, "").slice(-4) ? `DH-${order.id.replace(/\D/g, "").slice(-4)}` : order.id}</h2>
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
              <UserRound className="h-4 w-4 text-emerald-600" />
              Khách hàng
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-2xl font-black tracking-tight text-[#3c2b28]">{order.khach_hang?.ten ?? "Khách hàng"}</p>
              <a
                href={`tel:${customerPhone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 text-lg font-semibold text-[#5b4541] underline-offset-4 hover:underline"
              >
                <Phone className="h-4 w-4 text-emerald-600" />
                {customerPhone || "Chưa có số điện thoại"}
              </a>
            </div>
          </div>

          <div className="rounded-[22px] bg-emerald-600 p-4 text-white shadow-[0_12px_30px_rgba(16,185,129,0.18)]">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70">Số tiền cần thu</div>
            <p className="mt-3 text-4xl font-black tracking-tight">{formatCurrency(order.tong_tien ?? 0)}</p>
            <div className="mt-4 text-xs font-semibold text-white/75">Món trong đơn: {itemsCount}</div>
          </div>
        </div>

        <div className="rounded-[22px] bg-[#fffaf9] p-4 ring-1 ring-[#f4e3df]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#9b756f]">
            <MapPin className="h-4 w-4 text-emerald-600" />
            Địa chỉ giao hàng
          </div>
          <p className="mt-3 text-[1.05rem] font-bold leading-relaxed text-[#3f2f2c] sm:text-[1.15rem]">
            {order.khach_hang?.dia_chi || "Chưa có địa chỉ"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#8b6f6a]">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium ring-1 ring-[#eadbd8]">
              <Navigation2 className="h-3.5 w-3.5 text-emerald-600" />
              {order.id.replace(/\D/g, "").slice(-4) ? `DH-${order.id.replace(/\D/g, "").slice(-4)}` : order.id}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium ring-1 ring-[#eadbd8]">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {order.trang_thai ?? "Đang giao"}
            </span>
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-4 ring-1 ring-[#f4e3df]">
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b756f]">Ghi chú</div>
          <p className="mt-3 text-[1rem] leading-relaxed text-[#4e3935]">{order.khach_hang?.ghi_chu || "Không có ghi chú"}</p>
        </div>

        <div className="rounded-[22px] bg-white p-4 ring-1 ring-[#f4e3df]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b756f]">Danh sách món</div>
            <span className="rounded-full bg-[#e9f8f1] px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">{itemsCount} món</span>
          </div>
          <div className="mt-4 space-y-3">
            {(order.danh_sach_mon ?? []).map((item, index) => (
              <div key={`${getItemName(item)}-${index}`} className="flex items-start justify-between gap-4 border-b border-[#f5e8e6] pb-3 last:border-b-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[1.02rem] font-semibold text-[#4e3935]">
                    {getItemName(item)}{getItemQuantity(item) > 1 ? ` x${getItemQuantity(item)}` : ""}
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
          disabled={loading}
          onClick={() => onComplete(order.id)}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.22)] transition hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[60px]"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          {loading ? "Đang xử lý..." : "Đã giao xong"}
        </button>
      </div>
    </article>
  );
}

export default function ShipperTransitPage() {
  const [orders, setOrders] = useState<ShipperOrderDoc[]>([]);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUid(user?.uid ?? null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUid) {
      return;
    }

    const q = query(collection(db, "orders"), orderBy("thoi_gian_tao", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((document) => ({ id: document.id, ...(document.data() as Omit<ShipperOrderDoc, "id">) }));
        setOrders(items.filter((order) => order.trang_thai === "Đang giao hàng" && order.nguoi_giao === currentUid));
      },
      (snapshotError) => {
        console.error("Failed to subscribe to shipper orders:", snapshotError);
        setError("Không thể tải danh sách đơn hàng đang giao.");
      },
    );
  }, [currentUid]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleComplete(orderId: string) {
    if (updatingOrderId) return;
    setError(null);
    setToast(null);
    setUpdatingOrderId(orderId);

    try {
      await updateOrder(orderId, { trang_thai: "Hoàn tất" });
      setToast("Đơn hàng đã được giao xong.");
    } catch (completeError) {
      console.error("Failed to complete delivery:", completeError);
      setError("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const currentUserLabel = auth.currentUser?.displayName || currentUid || "Shipper";

  return (
    <div className="space-y-6 pb-6 text-[#241615]">
      {toast ? <div className="fixed right-4 top-4 z-50 rounded-2xl bg-[#0f172a] px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div> : null}

      <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] p-5 shadow-[0_16px_50px_rgba(17,24,39,0.05)] ring-1 ring-[#dbeee5] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e9f8f1] px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-emerald-700 ring-1 ring-emerald-200">
              <Bell className="h-3.5 w-3.5" />
              Trang điều phối shipper
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#163020] sm:text-5xl">Đơn hàng cần giao</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#51705f] sm:text-base">
              Chỉ hiển thị các đơn có trạng thái <strong>Đang giao</strong> và được gán cho shipper hiện tại.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-3xl bg-white p-4 ring-1 ring-[#dbeee5]">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#779084]">Tổng đơn</p>
              <p className="mt-2 text-3xl font-black text-emerald-700">{orders.length}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 ring-1 ring-[#dbeee5]">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#779084]">Tài khoản</p>
              <p className="mt-2 truncate text-lg font-black text-[#163020]">{currentUserLabel}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-[#f2d1d1] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#b42318]">{error}</div> : null}

      {orders.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[#dbeee5] bg-white px-5 py-12 text-center text-[#5f7569] shadow-[0_16px_50px_rgba(17,24,39,0.05)]">
          Hiện chưa có đơn nào đang giao cho bạn.
        </div>
      ) : (
        <section className="grid gap-5 md:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onComplete={handleComplete} loading={updatingOrderId === order.id} />
          ))}
        </section>
      )}
    </div>
  );
}
