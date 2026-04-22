"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, type Timestamp } from "firebase/firestore";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  Banknote,
  CalendarDays,
  ChartSpline,
  ClipboardList,
  Filter,
  Flame,
  ShoppingBag,
  TrendingUp,
  Truck,
} from "lucide-react";
import { db } from "@/app/lib/firebase";

type ReportRange = "today" | "7days" | "month";

type FirestoreOrderItem = {
  ten_mon?: string;
  tenMon?: string;
  ten_san_pham?: string;
  tenSanPham?: string;
  name?: string;
  quantity?: number | string;
  so_luong?: number | string;
  soLuong?: number | string;
};

type FirestoreOrder = {
  id: string;
  ma_don?: string;
  order_code?: string;
  customer_name?: string;
  ten_khach_hang?: string;
  customer?: string;
  tong_tien?: number | string;
  thoi_gian_tao?: Timestamp | { seconds: number; nanoseconds?: number } | Date | string;
  trang_thai?: string;
  status?: string;
  shipper?: string;
  nguoi_giao?: string;
  danh_sach_mon?: FirestoreOrderItem[];
};

type CompletedOrderRow = {
  id: string;
  code: string;
  timeLabel: string;
  timeMs: number;
  customer: string;
  total: number;
  shipper: string;
};

type TopSellingItem = {
  name: string;
  quantity: number;
};

type RevenuePoint = {
  label: string;
  revenue: number;
};

const rangeOptions: Array<{ id: ReportRange; label: string }> = [
  { id: "today", label: "Hôm nay" },
  { id: "7days", label: "7 ngày qua" },
  { id: "month", label: "Tháng này" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(value?: FirestoreOrder["thoi_gian_tao"]) {
  const date = toDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function toDate(value?: FirestoreOrder["thoi_gian_tao"]) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object" && "seconds" in value) {
    return new Date(value.seconds * 1000);
  }
  return null;
}

function getTimestampMs(value?: FirestoreOrder["thoi_gian_tao"]) {
  const date = toDate(value);
  return date ? date.getTime() : 0;
}

function getOrderStatus(order: FirestoreOrder) {
  return order.trang_thai || order.status || "Đang xử lý";
}

function getCustomerName(order: FirestoreOrder) {
  return order.customer_name || order.ten_khach_hang || order.customer || "Khách hàng";
}

function getOrderCode(order: FirestoreOrder) {
  return order.ma_don || order.order_code || order.id.slice(0, 8).toUpperCase();
}

function getShipperName(order: FirestoreOrder) {
  return order.shipper || order.nguoi_giao || "—";
}

function getItemName(item: FirestoreOrderItem) {
  return item.ten_mon || item.tenMon || item.ten_san_pham || item.tenSanPham || item.name || "Món ăn";
}

function getItemQuantity(item: FirestoreOrderItem) {
  const quantity = item.quantity ?? item.so_luong ?? item.soLuong ?? 0;
  return Number(quantity) || 0;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isWithinLastDays(date: Date, days: number) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
}

function isWithinCurrentMonth(date: Date) {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export default function AdminReportPage() {
  const [range, setRange] = useState<ReportRange>("today");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);

  useEffect(() => {
    if (!db) return;

    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const nextOrders = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<FirestoreOrder, "id">) }));
      setOrders(nextOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const report = useMemo(() => {
    const now = new Date();
    const completedOrders = orders.filter((order) => getOrderStatus(order) === "Hoàn thành");
    const canceledOrders = orders.filter((order) => getOrderStatus(order) === "Đã hủy");

    const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.tong_tien || 0), 0);

    const todayRevenue = completedOrders
      .filter((order) => {
        const date = toDate(order.thoi_gian_tao);
        return date ? isSameDay(date, now) : false;
      })
      .reduce((sum, order) => sum + Number(order.tong_tien || 0), 0);

    const successfulCount = completedOrders.length;
    const failedCount = canceledOrders.length;
    const successRate = orders.length ? (successfulCount / orders.length) * 100 : 0;

    const filteredCompletedOrders = completedOrders.filter((order) => {
      const date = toDate(order.thoi_gian_tao);
      if (!date) return false;
      if (range === "today") return isSameDay(date, now);
      if (range === "7days") return isWithinLastDays(date, 7);
      return isWithinCurrentMonth(date);
    });

    const recentOrders: CompletedOrderRow[] = filteredCompletedOrders
      .map((order) => {
        const date = toDate(order.thoi_gian_tao);
        return {
          id: order.id,
          code: getOrderCode(order),
          timeLabel: formatDateTime(order.thoi_gian_tao),
          timeMs: date?.getTime() || 0,
          customer: getCustomerName(order),
          total: Number(order.tong_tien || 0),
          shipper: getShipperName(order),
        };
      })
      .sort((a, b) => b.timeMs - a.timeMs)
      .slice(0, 10);

    const itemTotals = new Map<string, number>();
    completedOrders.forEach((order) => {
      (order.danh_sach_mon || []).forEach((item) => {
        const name = getItemName(item).trim();
        const quantity = getItemQuantity(item);
        if (!name || !quantity) return;
        itemTotals.set(name, (itemTotals.get(name) || 0) + quantity);
      });
    });

    const topSelling: TopSellingItem[] = Array.from(itemTotals.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const revenueByDayMap = new Map<string, number>();
    filteredCompletedOrders.forEach((order) => {
      const date = toDate(order.thoi_gian_tao);
      if (!date) return;
      const label = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(date);
      revenueByDayMap.set(label, (revenueByDayMap.get(label) || 0) + Number(order.tong_tien || 0));
    });

    const revenueChartData: RevenuePoint[] = Array.from(revenueByDayMap.entries())
      .map(([label, revenue]) => ({ label, revenue }))
      .sort((a, b) => {
        const [ad, am] = a.label.split("/").map(Number);
        const [bd, bm] = b.label.split("/").map(Number);
        return am === bm ? ad - bd : am - bm;
      });

    return {
      totalRevenue,
      todayRevenue,
      successfulCount,
      failedCount,
      successRate,
      recentOrders,
      topSelling,
      revenueChartData,
    };
  }, [orders, range]);

  const bestSeller = report.topSelling[0];

  return (
    <main className="space-y-6 pb-6 text-[#4b342f] lg:space-y-8">
      <section className="overflow-hidden rounded-[30px] border border-[#efdfdc] bg-gradient-to-br from-[#fff8f5] via-white to-[#f7eeeb] p-5 shadow-[0_16px_40px_rgba(97,39,25,0.06)] lg:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#b28b84]">Báo cáo chuyên sâu</p>
            <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-black tracking-tight text-[#241614]">
              Dashboard báo cáo Firestore
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#9b7d78] lg:text-base">
              Dữ liệu đồng bộ realtime từ collection <span className="font-semibold text-[#7f625e]">orders</span>, bao gồm doanh thu, tỷ lệ thành công, món bán chạy và bảng đơn hoàn thành gần đây.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {rangeOptions.map((item) => {
              const active = range === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRange(item.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${active ? "bg-[#c62828] text-white shadow-[0_12px_24px_rgba(198,40,40,0.22)]" : "bg-white text-[#7f625e] ring-1 ring-[#ead9d4] hover:bg-[#fff8f6]"}`}
                >
                  <Filter className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-[26px] border border-[#efe1dc] bg-white p-5 shadow-[0_10px_28px_rgba(97,39,25,0.05)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#a78b85]">Tổng doanh thu</p>
              <div className="mt-3 text-[1.9rem] font-black tracking-tight text-[#2c1b17] lg:text-[2.25rem]">
                {loading ? "—" : formatCurrency(report.totalRevenue)}
              </div>
              <p className="mt-2 text-sm text-[#9d7f79]">Tất cả đơn hàng hoàn thành</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0ef] text-[#c62828]">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="rounded-[26px] border border-[#efe1dc] bg-white p-5 shadow-[0_10px_28px_rgba(97,39,25,0.05)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#a78b85]">Đơn hoàn thành</p>
              <div className="mt-3 text-[1.9rem] font-black tracking-tight text-[#2c1b17] lg:text-[2.25rem]">
                {loading ? "—" : report.successfulCount}
              </div>
              <p className="mt-2 text-sm text-[#9d7f79]">
                Đã hủy: {report.failedCount} · Tỷ lệ thành công: {report.successRate.toFixed(1)}%
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eefaf1] text-[#2e7d32]">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="rounded-[26px] border border-[#efe1dc] bg-white p-5 shadow-[0_10px_28px_rgba(97,39,25,0.05)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#a78b85]">Món bán chạy nhất</p>
              <div className="mt-3 text-[1.3rem] font-black tracking-tight text-[#2c1b17] lg:text-[1.55rem]">
                {bestSeller ? bestSeller.name : "—"}
              </div>
              <p className="mt-2 text-sm text-[#9d7f79]">
                {bestSeller ? `${bestSeller.quantity} phần đã bán` : "Chưa có dữ liệu"}
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff7ea] text-[#d97706]">
              <Flame className="h-5 w-5" />
            </div>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
        <article className="rounded-[28px] border border-[#efdfdc] bg-white p-4 shadow-[0_12px_40px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#c62828]">
                <ChartSpline className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Biểu đồ doanh thu</span>
              </div>
              <h2 className="mt-2 text-[1.15rem] font-extrabold text-[#251714] sm:text-[1.3rem]">Doanh thu theo ngày</h2>
              <p className="mt-1 text-sm text-[#9d7f79]">Tự động ánh xạ dữ liệu theo khoảng thời gian đã chọn.</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff4f2] px-3 py-2 text-sm font-semibold text-[#c62828]">
              <TrendingUp className="h-4 w-4" />
              Realtime
            </div>
          </div>

          <div className="h-[300px] sm:h-[360px] lg:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.revenueChartData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportRevenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c62828" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#c62828" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1e3df" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#9d7f79", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN")}`} tick={{ fill: "#9d7f79", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid #efdeda",
                    background: "rgba(255,255,255,0.98)",
                    boxShadow: "0 18px 40px rgba(97,39,25,0.12)",
                  }}
                  labelStyle={{ color: "#4b342f", fontWeight: 700 }}
                  formatter={(value) => [formatCurrency(Number(value || 0)), "Doanh thu"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c62828"
                  strokeWidth={3}
                  fill="url(#reportRevenueFill)"
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#c62828" }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#c62828" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-[28px] border border-[#efdfdc] bg-white p-4 shadow-[0_12px_40px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff0ef] text-[#c62828]">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#251714]">Tổng kết nhanh</h3>
                <p className="text-sm text-[#9d7f79]">Theo bộ lọc đang chọn</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl bg-[#fcf8f7] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a78b85]">Doanh thu hôm nay</p>
                <div className="mt-2 text-2xl font-black text-[#c62828]">
                  {loading ? "—" : formatCurrency(report.todayRevenue)}
                </div>
              </div>
              <div className="rounded-2xl bg-[#fcf8f7] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a78b85]">Tỷ lệ thành công</p>
                <div className="mt-2 text-2xl font-black text-[#2e7d32]">
                  {loading ? "—" : `${report.successRate.toFixed(1)}%`}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#efdfdc] bg-white p-4 shadow-[0_12px_40px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eefaf1] text-[#2e7d32]">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#251714]">Top selling</h3>
                <p className="text-sm text-[#9d7f79]">3-5 món được đặt nhiều nhất</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {report.topSelling.length ? (
                report.topSelling.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl bg-[#fcf8f7] p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#c62828] ring-1 ring-[#efdeda]">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-[#2c1b17]">{item.name}</p>
                        <p className="text-sm text-[#9d7f79]">Số lượng đã bán</p>
                      </div>
                    </div>
                    <div className="text-lg font-black text-[#c62828]">{item.quantity}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-[#fcf8f7] p-4 text-sm text-[#8f746f]">Chưa có dữ liệu món ăn từ các đơn hoàn thành.</div>
              )}
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-[28px] border border-[#efdfdc] bg-white p-4 shadow-[0_12px_40px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#c62828]">
              <Truck className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-[0.2em]">Đơn hàng hoàn thành gần đây</span>
            </div>
            <h2 className="mt-2 text-[1.15rem] font-extrabold text-[#251714] sm:text-[1.3rem]">Danh sách chi tiết</h2>
            <p className="mt-1 text-sm text-[#9d7f79]">Hiển thị các đơn hoàn thành trong khoảng thời gian đã chọn.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff4f2] px-3 py-2 text-sm font-semibold text-[#c62828]">
            <CalendarDays className="h-4 w-4" />
            {rangeOptions.find((item) => item.id === range)?.label}
          </div>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-[#f1e5e1]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#f1e5e1]">
              <thead className="bg-[#fff8f6] text-left text-xs font-extrabold uppercase tracking-[0.16em] text-[#a78b85]">
                <tr>
                  <th className="px-4 py-4">Mã đơn</th>
                  <th className="px-4 py-4">Thời gian</th>
                  <th className="px-4 py-4">Khách hàng</th>
                  <th className="px-4 py-4 text-right">Tổng tiền</th>
                  <th className="px-4 py-4">Người giao</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5ece9] bg-white">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4" colSpan={5}>
                        <div className="h-12 animate-pulse rounded-2xl bg-[#f7f1ef]" />
                      </td>
                    </tr>
                  ))
                ) : report.recentOrders.length ? (
                  report.recentOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-[#fffaf9]">
                      <td className="px-4 py-4">
                        <div className="font-bold text-[#2c1b17]">{order.code}</div>
                        <div className="text-xs text-[#9d7f79]">ID: {order.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#6f5854]">{order.timeLabel}</td>
                      <td className="px-4 py-4 font-medium text-[#4b342f]">{order.customer}</td>
                      <td className="px-4 py-4 text-right font-black text-[#c62828]">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-4 text-sm text-[#6f5854]">{order.shipper}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-[#8f746f]" colSpan={5}>
                      Không có đơn hoàn thành nào trong khoảng thời gian đã chọn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
