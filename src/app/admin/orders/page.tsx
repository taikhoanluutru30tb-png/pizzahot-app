"use client";

import { useMemo, useState } from "react";
import { Clock3, CircleCheckBig, CircleX, Filter, LucideIcon, Truck } from "lucide-react";

type OrderStatus = "Chờ xử lý" | "Đang giao" | "Hoàn thành" | "Đã hủy";
type FilterKey = "Tất cả" | OrderStatus;

type Order = {
  id: string;
  customer: string;
  total: string;
  status: OrderStatus;
  time: string;
};

type StatusMeta = {
  label: OrderStatus;
  className: string;
  icon: LucideIcon;
};

const statusMeta: Record<OrderStatus, StatusMeta> = {
  "Chờ xử lý": {
    label: "Chờ xử lý",
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    icon: Clock3,
  },
  "Đang giao": {
    label: "Đang giao",
    className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    icon: Truck,
  },
  "Hoàn thành": {
    label: "Hoàn thành",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    icon: CircleCheckBig,
  },
  "Đã hủy": {
    label: "Đã hủy",
    className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    icon: CircleX,
  },
};

const filters: FilterKey[] = ["Tất cả", "Chờ xử lý", "Đang giao", "Hoàn thành", "Đã hủy"];

const orders: Order[] = [
  { id: "#ORD-9921", customer: "Pizza Hải Sản Pesto", total: "450.000đ", status: "Chờ xử lý", time: "15:30 • 24 Oct 2023" },
  { id: "#ORD-9918", customer: "Mì Ý Sốt Bò Bằm", total: "185.000đ", status: "Đang giao", time: "14:15 • 24 Oct 2023" },
  { id: "#ORD-9904", customer: "Combo Gia Đình XL", total: "890.000đ", status: "Hoàn thành", time: "12:40 • 24 Oct 2023" },
  { id: "#ORD-9897", customer: "Pizza Thập Cẩm", total: "320.000đ", status: "Đã hủy", time: "11:05 • 24 Oct 2023" },
  { id: "#ORD-9888", customer: "Salad Cá Hồi Đặc Biệt", total: "265.000đ", status: "Chờ xử lý", time: "09:48 • 24 Oct 2023" },
  { id: "#ORD-9874", customer: "Burger Phô Mai Đôi", total: "210.000đ", status: "Đang giao", time: "08:10 • 24 Oct 2023" },
];

export default function AdminOrdersPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("Tất cả");

  const filteredOrders = useMemo(() => {
    if (activeFilter === "Tất cả") return orders;
    return orders.filter((order) => order.status === activeFilter);
  }, [activeFilter]);

  const summary = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc[order.status] += 1;
        return acc;
      },
      { "Chờ xử lý": 0, "Đang giao": 0, "Hoàn thành": 0, "Đã hủy": 0 } as Record<OrderStatus, number>,
    );
  }, []);

  return (
    <div className="space-y-5 pb-6 text-[#241615] sm:space-y-6 lg:space-y-8">
      <section className="rounded-[28px] bg-gradient-to-br from-[#fffaf8] via-white to-[#fff4f2] p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] ring-1 ring-[#f0dfda] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b18a83]">Quản lý đơn hàng</p>
            <h1 className="text-[1.7rem] font-black tracking-tight text-[#241615] sm:text-[2rem] lg:text-[2.35rem]">
              Danh sách đơn hàng hệ thống
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[#9a7d77] sm:text-base">
              Theo dõi toàn bộ đơn hàng, lọc theo trạng thái và kiểm tra nhanh tình hình vận hành trên thiết bị mobile.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Tổng đơn", value: orders.length },
              { label: "Chờ xử lý", value: summary["Chờ xử lý"] },
              { label: "Đang giao", value: summary["Đang giao"] },
              { label: "Hoàn thành", value: summary["Hoàn thành"] },
            ].map((item) => (
              <div key={item.label} className="rounded-[22px] border border-[#f0e3df] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(97,39,25,0.04)]">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a88d86]">{item.label}</div>
                <div className="mt-2 text-2xl font-black text-[#c62828]">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#4d3a35]">
            <Filter className="h-4 w-4 text-[#c62828]" />
            Bộ lọc trạng thái
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filters.map((filter) => {
              const active = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#c62828] text-white shadow-[0_10px_22px_rgba(198,40,40,0.22)]"
                      : "bg-[#f5f2f1] text-[#6f5a55] hover:bg-[#eee8e6]"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-base font-extrabold text-[#2a1d1a] sm:text-lg">Tổng hợp đơn hàng</h2>
            <p className="mt-1 text-sm text-[#9a7d77]">{filteredOrders.length} đơn hàng phù hợp bộ lọc hiện tại</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {filteredOrders.map((order) => {
            const meta = statusMeta[order.status];
            const StatusIcon = meta.icon;

            return (
              <article
                key={order.id}
                className="rounded-[24px] border border-[#f1e5e1] bg-[#fffdfc] p-4 shadow-[0_10px_24px_rgba(97,39,25,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(97,39,25,0.07)] sm:p-5"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-bold text-[#c62828]">{order.id}</p>
                      <h3 className="truncate text-[1.05rem] font-extrabold tracking-tight text-[#2a1d1a] sm:text-[1.1rem]">
                        {order.customer}
                      </h3>
                      <p className="text-sm text-[#9f827c]">{order.time}</p>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${meta.className}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-[18px] bg-[#faf7f6] px-4 py-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#aa9089]">Tổng tiền</p>
                      <p className="mt-1 text-lg font-black text-[#241615]">{order.total}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#aa9089]">Trạng thái</p>
                      <p className="mt-1 text-sm font-semibold text-[#6b5751]">{order.status}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-[#eadbd7] bg-[#fffafa] px-4 py-10 text-center text-sm text-[#9a7d77]">
            Không có đơn hàng nào ở trạng thái này.
          </div>
        )}
      </section>
    </div>
  );
}
