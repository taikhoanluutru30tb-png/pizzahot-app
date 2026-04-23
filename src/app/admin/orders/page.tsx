"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  ChevronDown,
  CheckCircle,
  CircleX,
  Clock,
  Eye,
  Filter,
  MoreVertical,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";

import { db } from "@/app/lib/firebase";

type OrderStatus = "Chờ xử lý" | "Đang nấu" | "Đang giao" | "Hoàn thành" | "Đã hủy";
type FilterKey = "Tất cả" | OrderStatus;

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category?: string;
};

type Order = {
  id: string;
  khach_hang?: {
    ten?: string;
    sdt?: string;
    dia_chi?: string;
    ghi_chu?: string;
  };
  danh_sach_mon?: OrderItem[];
  tong_tien?: number;
  trang_thai?: OrderStatus;
  nguoi_tao?: string | null;
  thoi_gian_tao?: { seconds: number; nanoseconds: number } | null;
};

type StatusMeta = {
  label: OrderStatus;
  className: string;
  icon: ComponentType<{ className?: string }>;
};

const statusOptions: OrderStatus[] = ["Chờ xử lý", "Đang nấu", "Đang giao", "Hoàn thành", "Đã hủy"];
const filters: FilterKey[] = ["Tất cả", ...statusOptions];

const statusMeta: Record<OrderStatus, StatusMeta> = {
  "Chờ xử lý": { label: "Chờ xử lý", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", icon: Clock },
  "Đang nấu": { label: "Đang nấu", className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200", icon: UtensilsCrossed },
  "Đang giao": { label: "Đang giao", className: "bg-violet-50 text-violet-700 ring-1 ring-violet-200", icon: Truck },
  "Hoàn thành": { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", icon: CheckCircle },
  "Đã hủy": { label: "Đã hủy", className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200", icon: CircleX },
};

function formatCurrency(value?: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value ?? 0);
}

function formatDateTime(timestamp?: { seconds: number; nanoseconds: number } | null) {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp.seconds * 1000);
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function AdminOrdersPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("Tất cả");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("thoi_gian_tao", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nextOrders = snapshot.docs.map((document) => ({ id: document.id, ...(document.data() as Omit<Order, "id">) }));
      setOrders(nextOrders);
      setSelectedOrder((current) => {
        if (!current) return current;
        return nextOrders.find((order) => order.id === current.id) ?? null;
      });
    });

    return () => unsubscribe();
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "Tất cả") return orders;
    return orders.filter((order) => order.trang_thai === activeFilter);
  }, [activeFilter, orders]);

  const summary = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        const status = order.trang_thai ?? "Chờ xử lý";
        acc[status] += 1;
        return acc;
      },
      { "Chờ xử lý": 0, "Đang nấu": 0, "Đang giao": 0, "Hoàn thành": 0, "Đã hủy": 0 } as Record<OrderStatus, number>,
    );
  }, [orders]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    await updateDoc(doc(db, "orders", orderId), { trang_thai: status });
    setOpenMenuId(null);
  }

  return (
    <div className="space-y-5 pb-6 text-[#241615] sm:space-y-6 lg:space-y-8">
      <section className="rounded-[28px] bg-gradient-to-br from-[#fffaf8] via-white to-[#fff4f2] p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] ring-1 ring-[#f0dfda] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b18a83]">Quản lý đơn hàng</p>
            <h1 className="text-[1.7rem] font-black tracking-tight text-[#241615] sm:text-[2rem] lg:text-[2.35rem]">Danh sách đơn hàng</h1>
            <p className="max-w-2xl text-sm leading-6 text-[#9a7d77] sm:text-base">
              Dữ liệu cập nhật liên tục
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: "Tổng đơn", value: orders.length },
              { label: "Chờ xử lý", value: summary["Chờ xử lý"] },
              { label: "Đang nấu", value: summary["Đang nấu"] },
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
                <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-[#c62828] text-white shadow-[0_10px_22px_rgba(198,40,40,0.22)]" : "bg-[#f5f2f1] text-[#6f5a55] hover:bg-[#eee8e6]"}`}>
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
            <h2 className="text-base font-extrabold text-[#2a1d1a] sm:text-lg">Đơn hàng</h2>
            <p className="mt-1 text-sm text-[#9a7d77]">{filteredOrders.length} đơn hàng phù hợp bộ lọc hiện tại</p>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-[24px] border border-[#f1e5e1] bg-white shadow-[0_10px_24px_rgba(97,39,25,0.04)] md:block">
          <table className="min-w-full divide-y divide-[#f3e8e5]">
            <thead className="bg-[#fcf8f7] text-left text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#a78b85]">
              <tr>
                <th className="px-4 py-4">Mã đơn</th>
                <th className="px-4 py-4">Tên khách hàng</th>
                <th className="px-4 py-4">Tổng tiền</th>
                <th className="px-4 py-4">Thời gian đặt</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-4 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f6eeeb] bg-white">
              {filteredOrders.map((order) => {
                const status = (order.trang_thai ?? "Chờ xử lý") as OrderStatus;
                const meta = statusMeta[status];
                const StatusIcon = meta.icon;
                return (
                  <tr key={order.id} className="cursor-pointer transition hover:bg-[#fffdfc]" onClick={() => setSelectedOrder(order)}>
                    <td className="px-4 py-4 font-mono text-sm font-bold text-[#c62828]">{order.id}</td>
                    <td className="px-4 py-4 font-semibold text-[#2a1d1a]">{order.khach_hang?.ten || "Không có tên"}</td>
                    <td className="px-4 py-4 font-black text-[#2a1d1a]">{formatCurrency(order.tong_tien)}</td>
                    <td className="px-4 py-4 text-sm text-[#6f5a55]">{formatDateTime(order.thoi_gian_tao ?? null)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${meta.className}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block text-left">
                        <button type="button" onClick={() => setOpenMenuId((current) => (current === order.id ? null : order.id))} className="inline-flex items-center gap-2 rounded-xl border border-[#eadad5] bg-white px-3 py-2 text-sm font-semibold text-[#6f5752] transition hover:bg-[#faf6f5]">
                          <MoreVertical className="h-4 w-4" />
                          Điều chỉnh
                        </button>
                        {openMenuId === order.id ? (
                          <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-[#eadad5] bg-white shadow-[0_16px_36px_rgba(0,0,0,0.12)]">
                            {statusOptions.map((statusOption) => (
                              <button key={statusOption} type="button" onClick={() => updateStatus(order.id, statusOption)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#4d3a35] transition hover:bg-[#fff7f6]">
                                <span>{statusOption}</span>
                                <ChevronDown className="h-4 w-4 text-[#c62828]" />
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 md:hidden">
          {filteredOrders.map((order) => {
            const status = (order.trang_thai ?? "Chờ xử lý") as OrderStatus;
            const meta = statusMeta[status];
            const StatusIcon = meta.icon;
            return (
              <article key={order.id} className="rounded-[24px] border border-[#f1e5e1] bg-[#fffdfc] p-4 shadow-[0_10px_24px_rgba(97,39,25,0.04)]" onClick={() => setSelectedOrder(order)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="font-mono text-sm font-bold text-[#c62828]">{order.id}</p>
                    <h3 className="truncate text-base font-extrabold text-[#2a1d1a]">{order.khach_hang?.ten || "Không có tên"}</h3>
                    <p className="text-sm text-[#9f827c]">{formatDateTime(order.thoi_gian_tao ?? null)}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${meta.className}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {meta.label}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-[18px] bg-[#faf7f6] px-4 py-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#aa9089]">Tổng tiền</p>
                    <p className="mt-1 text-lg font-black text-[#241615]">{formatCurrency(order.tong_tien)}</p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId((current) => (current === order.id ? null : order.id)); }} className="inline-flex items-center gap-2 rounded-xl border border-[#eadad5] bg-white px-3 py-2 text-sm font-semibold text-[#6f5752] transition hover:bg-[#faf6f5]">
                    <Eye className="h-4 w-4" />
                    Xem / Sửa
                  </button>
                </div>

                {openMenuId === order.id ? (
                  <div className="mt-3 grid gap-2 rounded-2xl border border-[#eadad5] bg-white p-3">
                    {statusOptions.map((statusOption) => (
                      <button key={statusOption} type="button" onClick={(e) => { e.stopPropagation(); updateStatus(order.id, statusOption); }} className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#4d3a35] transition hover:bg-[#fff7f6]">
                        {statusOption}
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#eadbd7] bg-[#fffafa] px-4 py-10 text-center text-sm text-[#9a7d77]">Không có đơn hàng nào ở trạng thái này.</div>
        ) : null}
      </section>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="mx-auto mt-10 max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-[#f2e7e4] px-5 py-4 sm:px-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b28b84]">Chi tiết đơn hàng</p>
                <h2 className="mt-1 text-xl font-black text-[#241615]">{selectedOrder.id}</h2>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="rounded-full border border-[#eadad5] px-3 py-2 text-sm font-semibold text-[#6f5752] transition hover:bg-[#faf6f5]">Đóng</button>
            </div>

            <div className="grid gap-5 px-5 py-5 sm:px-6">
              <div className="grid gap-3 rounded-[24px] bg-[#fffaf9] p-4 ring-1 ring-[#f1e5e1] sm:grid-cols-2">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a78b85]">Khách hàng</p><p className="mt-1 font-semibold text-[#2a1d1a]">{selectedOrder.khach_hang?.ten || "Không có tên"}</p></div>
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a78b85]">SĐT</p><p className="mt-1 font-semibold text-[#2a1d1a]">{selectedOrder.khach_hang?.sdt || "N/A"}</p></div>
                <div className="sm:col-span-2"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a78b85]">Địa chỉ</p><p className="mt-1 font-semibold text-[#2a1d1a]">{selectedOrder.khach_hang?.dia_chi || "N/A"}</p></div>
                <div className="sm:col-span-2"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a78b85]">Ghi chú</p><p className="mt-1 font-semibold text-[#2a1d1a]">{selectedOrder.khach_hang?.ghi_chu || "Không có ghi chú"}</p></div>
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a78b85]">Tổng tiền</p><p className="mt-1 text-lg font-black text-[#c62828]">{formatCurrency(selectedOrder.tong_tien)}</p></div>
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a78b85]">Thời gian đặt</p><p className="mt-1 font-semibold text-[#2a1d1a]">{formatDateTime(selectedOrder.thoi_gian_tao ?? null)}</p></div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2"><Eye className="h-4 w-4 text-[#c62828]" /><h3 className="text-base font-bold text-[#2a1d1a]">Danh sách món</h3></div>
                <div className="space-y-3">
                  {(selectedOrder.danh_sach_mon || []).map((item) => (
                    <div key={item.id + item.name} className="flex items-center justify-between rounded-2xl border border-[#f1e5e1] bg-white px-4 py-3">
                      <div>
                        <p className="font-semibold text-[#2a1d1a]">{item.name}</p>
                        <p className="text-sm text-[#9a7d77]">SL: {item.quantity} • {formatCurrency(item.price)}</p>
                      </div>
                      <p className="font-black text-[#c62828]">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
