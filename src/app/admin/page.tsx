"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, Clock3, LineChart, Package, ShoppingCart, Users } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

type OrderStatus = string;

type FirestoreOrder = {
  id: string;
  customer_name?: string;
  ten_khach_hang?: string;
  customer?: string;
  tong_tien?: number | string;
  thoi_gian_tao?: { seconds: number; nanoseconds?: number } | Date | string;
  trang_thai?: OrderStatus;
  status?: OrderStatus;
};

type MetricCard = {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof Banknote;
  bgClass: string;
  iconClass: string;
  valueClass: string;
};

type RecentOrder = {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAtLabel: string;
  createdAtMs: number;
};

const statusStyles: Record<string, { label: string; className: string }> = {
  "Hoàn thành": { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  "Đã hủy": { label: "Đã hủy", className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200" },
  "Đang xử lý": { label: "Đang xử lý", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  "Đang chuẩn bị": { label: "Đang chuẩn bị", className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  "Đang giao": { label: "Đang giao", className: "bg-violet-50 text-violet-700 ring-1 ring-violet-200" },
};

function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
}

function formatDateTime(value?: FirestoreOrder["thoi_gian_tao"]) {
  if (!value) return "—";

  const date =
    value instanceof Date
      ? value
      : typeof value === "string"
        ? new Date(value)
        : typeof value === "object" && value && "seconds" in value
          ? new Date(value.seconds * 1000)
          : null;

  if (!date || Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getTimestampMs(value?: FirestoreOrder["thoi_gian_tao"]) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") return new Date(value).getTime();
  if (typeof value === "object" && value && "seconds" in value) return value.seconds * 1000;
  return 0;
}

function getCustomerName(order: FirestoreOrder) {
  return order.customer_name || order.ten_khach_hang || order.customer || "Khách hàng";
}

function getOrderStatus(order: FirestoreOrder) {
  return order.trang_thai || order.status || "Đang xử lý";
}

function RevenueSummaryCard({ loading, metrics }: { loading: boolean; metrics: MetricCard[] }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <article key={metric.title} className={`rounded-[28px] p-5 shadow-[0_24px_60px_rgba(82,28,20,0.08)] ${metric.bgClass}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${metric.valueClass === "text-white" ? "text-white/85" : "text-[#a78c86]"}`}>
                  {metric.title}
                </p>
                <div className={`mt-4 text-[2rem] font-black tracking-tight ${metric.valueClass} lg:text-[2.35rem]`}>
                  {loading && index < 2 ? <span className="inline-block h-8 w-32 animate-pulse rounded bg-black/10 align-middle" /> : metric.value}
                </div>
                <p className={`mt-2 text-sm font-medium ${metric.valueClass === "text-white" ? "text-white/80" : "text-[#a78c86]"}`}>
                  {metric.subtitle}
                </p>
              </div>
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${metric.iconClass}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function RevenueChart({ loading, orders }: { loading: boolean; orders: RecentOrder[] }) {
  const weekData = useMemo(() => {
    const totals = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((label) => ({ label, value: 0 }));

    orders.forEach((order) => {
      if (order.status !== "Hoàn thành" || !order.createdAtMs) return;
      const day = new Date(order.createdAtMs).getDay();
      totals[day].value += order.total;
    });

    return totals;
  }, [orders]);

  const max = Math.max(1, ...weekData.map((item) => item.value));

  return (
    <div className="rounded-[32px] bg-[#fffdfc] p-5 shadow-[0_24px_60px_rgba(82,28,20,0.08)] lg:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.05rem] font-extrabold text-[#2f1f1b] lg:text-[1.15rem]">Thống kê doanh thu</h2>
          <p className="mt-1 text-sm text-[#9a7d77]">Tổng doanh thu theo ngày trong dữ liệu hiện có</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#fff4f3] px-3 py-2 text-sm font-semibold text-[#c62828]">
          <LineChart className="h-4 w-4" />
          Realtime
        </div>
      </div>

      <div className="h-[260px] lg:h-[310px]">
        {loading ? (
          <div className="grid h-full grid-cols-7 items-end gap-3 sm:gap-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="h-[220px] w-full animate-pulse rounded-t-[18px] bg-[#f2ecea] lg:h-[260px]" />
                <div className="h-3 w-6 animate-pulse rounded bg-[#f2ecea]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-end gap-3 sm:gap-4">
            {weekData.map((item) => {
              const height = Math.max(18, (item.value / max) * 100);
              const active = item.label === "T7";

              return (
                <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-3">
                  <div className="flex w-full items-end justify-center">
                    <div
                      className={`w-full max-w-[54px] rounded-t-[18px] shadow-[0_12px_24px_rgba(198,40,40,0.12)] transition ${active ? "bg-[#c62828]" : "bg-[#e6e3e2]"}`}
                      style={{ height: `${height}%` }}
                      aria-label={`${item.label} ${item.value}`}
                    />
                  </div>
                  <div className={`text-[11px] font-bold ${active ? "text-[#c62828]" : "text-[#a89a96]"}`}>{item.label}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [processingOrders, setProcessingOrders] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    if (!db) return;

    let unsubscribed = false;
    let readyCount = 0;
    const markReady = () => {
      readyCount += 1;
      if (readyCount >= 3 && !unsubscribed) setLoading(false);
    };

    const ordersRef = collection(db, "orders");
    const usersRef = collection(db, "users");
    const menuRef = collection(db, "menu");

    const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
      let revenue = 0;
      let completed = 0;
      let processing = 0;
      const mappedOrders: RecentOrder[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as FirestoreOrder;
        const status = getOrderStatus(data);
        const total = Number(data.tong_tien || 0);
        const createdAtMs = getTimestampMs(data.thoi_gian_tao);

        if (status === "Hoàn thành") {
          revenue += total;
          completed += 1;
        } else if (status !== "Đã hủy") {
          processing += 1;
        }

        mappedOrders.push({
          id: doc.id,
          customerName: getCustomerName(data),
          total,
          status,
          createdAtLabel: formatDateTime(data.thoi_gian_tao),
          createdAtMs,
        });
      });

      mappedOrders.sort((a, b) => b.createdAtMs - a.createdAtMs);

      setTotalRevenue(revenue);
      setCompletedOrders(completed);
      setProcessingOrders(processing);
      setRecentOrders(mappedOrders.slice(0, 5));
      markReady();
    });

    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data() as { role?: string };
        if (["staff", "ctv", "shipper"].includes(String(data.role || "").toLowerCase())) count += 1;
      });
      setStaffCount(count);
      markReady();
    });

    const unsubscribeMenu = onSnapshot(menuRef, (snapshot) => {
      setMenuCount(snapshot.size);
      markReady();
    });

    return () => {
      unsubscribed = true;
      unsubscribeOrders();
      unsubscribeUsers();
      unsubscribeMenu();
    };
  }, []);

  const metrics: MetricCard[] = useMemo(
    () => [
      {
        title: "Tổng doanh thu",
        value: formatVnd(totalRevenue),
        subtitle: `${completedOrders} đơn hoàn thành`,
        icon: Banknote,
        bgClass: "bg-[#c62828] text-white",
        iconClass: "bg-white/15 text-white",
        valueClass: "text-white",
      },
      {
        title: "Tổng đơn hàng",
        value: String(completedOrders + processingOrders),
        subtitle: `${processingOrders} đơn đang xử lý`,
        icon: ShoppingCart,
        bgClass: "bg-white text-[#4b3a37]",
        iconClass: "bg-[#f7e8e7] text-[#c62828]",
        valueClass: "text-[#241615]",
      },
      {
        title: "Nhân sự",
        value: String(staffCount),
        subtitle: "Staff, CTV, Shipper",
        icon: Users,
        bgClass: "bg-white text-[#4b3a37]",
        iconClass: "bg-[#f3ede8] text-[#7c4d2f]",
        valueClass: "text-[#241615]",
      },
      {
        title: "Món ăn",
        value: String(menuCount),
        subtitle: "Món đang có trong thực đơn",
        icon: Package,
        bgClass: "bg-white text-[#4b3a37]",
        iconClass: "bg-[#edf9ef] text-[#15803d]",
        valueClass: "text-[#241615]",
      },
    ],
    [completedOrders, menuCount, processingOrders, staffCount, totalRevenue],
  );

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#fff8f5] via-[#fffdfc] to-[#f6ebe8] p-5 shadow-[0_24px_60px_rgba(82,28,20,0.08)] lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#b4534c]">Chào buổi sáng</p>
            <h1 className="mt-3 text-[2.2rem] font-black tracking-tight text-[#2b1814] lg:text-[4rem]">Dashboard quản trị</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8f6f68] lg:text-[1rem]">
              Dữ liệu đang được đồng bộ theo thời gian thực từ Firebase để bạn theo dõi doanh thu, đơn hàng và vận hành nhanh hơn.
            </p>
          </div>

          <div className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-gradient-to-r from-[#b91c1c] to-[#dc2626] px-6 py-3 text-sm font-bold text-white shadow-[0_18px_30px_rgba(185,28,28,0.22)]">
            <Clock3 className="h-4 w-4" />
            Realtime Dashboard
          </div>
        </div>
      </section>

      <RevenueSummaryCard loading={loading} metrics={metrics} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <RevenueChart loading={loading} orders={recentOrders} />
        </div>

        <aside className="rounded-[28px] border border-[#efe2df] bg-white p-5 shadow-[0_10px_30px_rgba(97,39,25,0.06)] lg:p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[1.05rem] font-extrabold text-[#2f1f1b] lg:text-[1.15rem]">Tổng quan nhanh</h2>
              <p className="mt-1 text-sm text-[#9a7d77]">Cập nhật từ Firebase</p>
            </div>
            <span className="rounded-full bg-[#fff4f3] px-3 py-1 text-xs font-bold text-[#c62828]">Live</span>
          </div>

          <div className="space-y-4">
            <div className="rounded-[22px] bg-[#fcf9f8] p-4">
              <p className="text-sm text-[#a78c86]">Đơn hoàn thành</p>
              <p className="mt-1 text-2xl font-black text-[#2f1f1b]">{completedOrders}</p>
            </div>
            <div className="rounded-[22px] bg-[#fcf9f8] p-4">
              <p className="text-sm text-[#a78c86]">Đơn đang xử lý</p>
              <p className="mt-1 text-2xl font-black text-[#2f1f1b]">{processingOrders}</p>
            </div>
            <div className="rounded-[22px] bg-[#fcf9f8] p-4">
              <p className="text-sm text-[#a78c86]">Nhân sự</p>
              <p className="mt-1 text-2xl font-black text-[#2f1f1b]">{staffCount}</p>
            </div>
            <div className="rounded-[22px] bg-[#fcf9f8] p-4">
              <p className="text-sm text-[#a78c86]">Món ăn</p>
              <p className="mt-1 text-2xl font-black text-[#2f1f1b]">{menuCount}</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-[28px] border border-[#efe2df] bg-white p-5 shadow-[0_10px_30px_rgba(97,39,25,0.06)] lg:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[1.05rem] font-extrabold text-[#2f1f1b] lg:text-[1.15rem]">Đơn hàng gần đây</h2>
            <p className="mt-1 text-sm text-[#9a7d77]">5 đơn mới nhất theo thời gian tạo</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-[92px] animate-pulse rounded-[22px] bg-[#f7f2f0]" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => {
              const status = statusStyles[order.status] || { label: order.status, className: "bg-slate-50 text-slate-700 ring-1 ring-slate-200" };

              return (
                <article key={order.id} className="rounded-[22px] border border-[#f1e5e1] bg-[#fffdfc] p-4 shadow-[0_8px_20px_rgba(97,39,25,0.04)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff2f0] text-sm font-black text-[#c62828]">
                        {order.id.slice(0, 4).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-[#2f1f1b]">{order.customerName}</h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
                        </div>
                        <p className="mt-1 text-sm text-[#9f827c]">{order.createdAtLabel}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:text-right">
                      <div className="text-lg font-black text-[#c62828]">{formatVnd(order.total)}</div>
                      <div className="text-sm font-medium text-[#aa8f89]">Đặt gần đây</div>
                    </div>
                  </div>
                </article>
              );
            })}

            {!recentOrders.length && <div className="rounded-[22px] bg-[#fcf9f8] p-4 text-sm text-[#8f6f68]">Chưa có đơn hàng nào để hiển thị.</div>}
          </div>
        )}
      </section>
    </div>
  );
}
