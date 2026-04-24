"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  Loader2,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";

type OrderStatus = "Chờ xử lý" | "Đang nấu" | "Đang giao" | "Hoàn thành" | "Đã hủy";
type FilterKey = "Tất cả" | OrderStatus;

type OrderItem = {
  id?: string;
  name?: unknown;
  ten_mon?: unknown;
  price?: unknown;
  gia_tien?: unknown;
  quantity?: unknown;
  so_luong?: unknown;
  thanh_tien?: unknown;
  phan_loai?: unknown;
  category?: unknown;
};

type Order = {
  id: string;
  khach_hang?: {
    ten?: string;
    sdt?: string;
  };
  danh_sach_mon?: OrderItem[];
  tong_tien?: number;
  trang_thai?: OrderStatus;
  nguoi_tao?: string | null;
  nguoi_giao?: string | null;
  thoi_gian_tao?: { seconds: number; nanoseconds: number } | null;
};

type User = {
  uid: string;
  ten?: string;
  displayName?: string;
  role?: string;
};

const statuses: OrderStatus[] = ["Chờ xử lý", "Đang nấu", "Đang giao", "Hoàn thành", "Đã hủy"];
const filters: FilterKey[] = ["Tất cả", ...statuses];

const statusMeta: Record<OrderStatus, { label: string; className: string; icon: typeof Clock3 }> = {
  "Chờ xử lý": { label: "Chờ xử lý", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", icon: Clock3 },
  "Đang nấu": { label: "Đang nấu", className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200", icon: UtensilsCrossed },
  "Đang giao": { label: "Đang giao", className: "bg-violet-50 text-violet-700 ring-1 ring-violet-200", icon: Truck },
  "Hoàn thành": { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", icon: CheckCircle2 },
  "Đã hủy": { label: "Đã hủy", className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200", icon: Clock3 },
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatCurrency(value?: number) {
  return currencyFormatter.format(value ?? 0);
}

function formatDateTime(timestamp?: { seconds: number; nanoseconds: number } | null) {
  if (!timestamp) return "N/A";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(timestamp.seconds * 1000));
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function lineItemName(item: OrderItem) {
  return toText(item.ten_mon || item.name) || "Món ăn";
}

function lineItemQuantity(item: OrderItem) {
  return Number(item.so_luong || item.quantity || 0);
}

function lineItemPrice(item: OrderItem) {
  return Number(item.gia_tien || item.price || item.thanh_tien || 0);
}

function orderItemTotal(item: OrderItem) {
  const qty = lineItemQuantity(item) || 1;
  const unit = lineItemPrice(item);
  return Number(item.thanh_tien || unit * qty || 0);
}

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("Tất cả");
  const [openShipModalOrderId, setOpenShipModalOrderId] = useState<string | null>(null);
  const [selectedShipperId, setSelectedShipperId] = useState("");
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ordersQuery = query(collection(db, "orders"), orderBy("thoi_gian_tao", "desc"));
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot: QueryDocumentSnapshot<DocumentData>[] | any) => {
        setOrders(snapshot.docs.map((document: QueryDocumentSnapshot<DocumentData>) => ({ id: document.id, ...(document.data() as Omit<Order, "id">) })));
      },
      (snapshotError) => {
        console.error("Failed to subscribe to orders:", snapshotError);
        setError("Không thể tải danh sách đơn hàng.");
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const usersQuery = query(collection(db, "users"), where("role", "==", "shipper"));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      setUsers(
        snapshot.docs.map((document) => {
          const data = document.data() as Record<string, unknown>;
          return {
            uid: document.id,
            ten: toText(data.ten),
            displayName: toText(data.displayName),
            role: toText(data.role),
          };
        }),
      );
    });

    return unsubscribe;
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "Tất cả") return orders;
    return orders.filter((order) => (order.trang_thai ?? "Chờ xử lý") === activeFilter);
  }, [activeFilter, orders]);

  const summary = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        const status = (order.trang_thai ?? "Chờ xử lý") as OrderStatus;
        acc[status] += 1;
        return acc;
      },
      { "Chờ xử lý": 0, "Đang nấu": 0, "Đang giao": 0, "Hoàn thành": 0, "Đã hủy": 0 } as Record<OrderStatus, number>,
    );
  }, [orders]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setBusyOrderId(orderId);
    setError(null);
    try {
      await updateDoc(doc(db, "orders", orderId), { trang_thai: status });
      if (status === "Đang giao") {
        setOpenShipModalOrderId(orderId);
      }
    } catch (updateError) {
      console.error("Failed to update order status:", updateError);
      setError("Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setBusyOrderId(null);
    }
  }

  async function assignShipper() {
    if (!openShipModalOrderId || !selectedShipperId) {
      setError("Vui lòng chọn shipper trước khi gán.");
      return;
    }

    setBusyOrderId(openShipModalOrderId);
    setError(null);
    try {
      await updateDoc(doc(db, "orders", openShipModalOrderId), {
        trang_thai: "Đang giao",
        nguoi_giao: selectedShipperId,
      });
      setOpenShipModalOrderId(null);
      setSelectedShipperId("");
    } catch (assignError) {
      console.error("Failed to assign shipper:", assignError);
      setError("Không thể gán shipper cho đơn hàng.");
    } finally {
      setBusyOrderId(null);
    }
  }

  const activeOrder = openShipModalOrderId ? orders.find((order) => order.id === openShipModalOrderId) ?? null : null;

  return (
    <div className="space-y-6 pb-8 text-[#241615] sm:space-y-8">
      <section className="rounded-[28px] bg-gradient-to-br from-[#fffaf8] via-white to-[#fff4f2] p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] ring-1 ring-[#f0dfda] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1f0] px-3 py-1 text-xs font-semibold text-[#c62828] ring-1 ring-[#f4c8c4]">
                <ShoppingBag className="h-3.5 w-3.5" />
                Staff / Order Control
              </div>
              <h1 className="text-[1.8rem] font-black tracking-tight text-[#241615] sm:text-[2.2rem] lg:text-[2.5rem]">Quản lý đơn hàng</h1>
              <p className="max-w-3xl text-sm leading-6 text-[#9a7d77] sm:text-base">
                Staff có quyền điều phối đơn tương đương Admin, bao gồm cập nhật trạng thái và gán shipper khi chuyển sang "Đang giao".
              </p>
            </div>
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

      {error ? <div className="rounded-2xl border border-[#f2d1d1] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#b42318]">{error}</div> : null}

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
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-[#c62828] text-white shadow-[0_10px_22px_rgba(198,40,40,0.22)]" : "bg-[#f5f2f1] text-[#6f5a55] hover:bg-[#eee8e6]"}`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="hidden overflow-hidden rounded-[24px] border border-[#f1e5e1] bg-white shadow-[0_10px_24px_rgba(97,39,25,0.04)] md:block">
          <table className="min-w-full divide-y divide-[#f3e8e5]">
            <thead className="bg-[#fcf8f7] text-left text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#a78b85]">
              <tr>
                <th className="px-4 py-4">Mã đơn</th>
                <th className="px-4 py-4">Khách hàng</th>
                <th className="px-4 py-4">Món ăn</th>
                <th className="px-4 py-4">Tổng tiền</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-4 py-4">Người giao</th>
                <th className="px-4 py-4 text-right">Điều phối</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f6eeeb] bg-white">
              {filteredOrders.map((order) => {
                const status = (order.trang_thai ?? "Chờ xử lý") as OrderStatus;
                const meta = statusMeta[status];
                const StatusIcon = meta.icon;
                const shipperName = users.find((user) => user.uid === order.nguoi_giao)?.ten || users.find((user) => user.uid === order.nguoi_giao)?.displayName || order.nguoi_giao || "Chưa gán";
                return (
                  <tr key={order.id} className="transition hover:bg-[#fffdfc]">
                    <td className="px-4 py-4 font-mono text-sm font-bold text-[#c62828]">{order.id}</td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[#2a1d1a]">{order.khach_hang?.ten || "Không có tên"}</div>
                      <div className="text-sm text-[#9a7d77]">{order.khach_hang?.sdt || "N/A"}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#6f5a55]">
                      <div className="max-w-[280px] space-y-1">
                        {(order.danh_sach_mon || []).slice(0, 3).map((item, index) => (
                          <div key={`${order.id}-${index}`} className="truncate">
                            {lineItemName(item)} x {lineItemQuantity(item) || 1}
                          </div>
                        ))}
                        {(order.danh_sach_mon || []).length > 3 ? <div className="text-xs font-semibold text-[#c62828]">+ {(order.danh_sach_mon || []).length - 3} món khác</div> : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-black text-[#2a1d1a]">{formatCurrency(order.tong_tien)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${meta.className}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#6f5a55]">{shipperName}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busyOrderId === order.id}
                          onClick={() => updateStatus(order.id, status === "Chờ xử lý" ? "Đang nấu" : status === "Đang nấu" ? "Đang giao" : status)}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#eadad5] bg-white px-3 py-2 text-sm font-semibold text-[#6f5752] transition hover:bg-[#faf6f5] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busyOrderId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
                          Điều phối
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenShipModalOrderId(order.id);
                            setSelectedShipperId(order.nguoi_giao || users[0]?.uid || "");
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#c62828] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#a61f1f]"
                        >
                          <Users className="h-4 w-4" />
                          Gán shipper
                        </button>
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
            const shipperName = users.find((user) => user.uid === order.nguoi_giao)?.ten || users.find((user) => user.uid === order.nguoi_giao)?.displayName || order.nguoi_giao || "Chưa gán";
            return (
              <article key={order.id} className="rounded-[24px] border border-[#f1e5e1] bg-[#fffdfc] p-4 shadow-[0_10px_24px_rgba(97,39,25,0.04)]">
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

                <div className="mt-4 rounded-[18px] bg-[#faf7f6] px-4 py-3 text-sm text-[#6f5a55]">
                  <div className="font-semibold text-[#2a1d1a]">Món ăn</div>
                  <div className="mt-2 space-y-1">
                    {(order.danh_sach_mon || []).slice(0, 3).map((item, index) => (
                      <div key={`${order.id}-${index}`} className="flex items-center justify-between gap-2">
                        <span className="truncate">{lineItemName(item)} x {lineItemQuantity(item) || 1}</span>
                        <span className="font-semibold text-[#2a1d1a]">{formatCurrency(orderItemTotal(item))}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-[18px] bg-[#faf7f6] px-4 py-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#aa9089]">Người giao</p>
                    <p className="mt-1 text-sm font-semibold text-[#241615]">{shipperName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#aa9089]">Tổng tiền</p>
                    <p className="mt-1 text-lg font-black text-[#241615]">{formatCurrency(order.tong_tien)}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateStatus(order.id, status === "Chờ xử lý" ? "Đang nấu" : status === "Đang nấu" ? "Đang giao" : status)}
                    disabled={busyOrderId === order.id}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#eadad5] bg-white px-3 py-2 text-sm font-semibold text-[#6f5752] transition hover:bg-[#faf6f5] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyOrderId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
                    Điều phối
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenShipModalOrderId(order.id);
                      setSelectedShipperId(order.nguoi_giao || users[0]?.uid || "");
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c62828] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#a61f1f]"
                  >
                    <Users className="h-4 w-4" />
                    Gán shipper
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#eadbd7] bg-[#fffafa] px-4 py-10 text-center text-sm text-[#9a7d77]">Không có đơn hàng nào ở trạng thái này.</div>
        ) : null}
      </section>

      {openShipModalOrderId ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 backdrop-blur-sm" onClick={() => setOpenShipModalOrderId(null)}>
          <div className="mx-auto mt-16 w-full max-w-xl rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-[#f2e7e4] px-5 py-4 sm:px-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b28b84]">Gán shipper</p>
                <h2 className="mt-1 text-xl font-black text-[#241615]">{activeOrder ? activeOrder.id : "Chọn đơn hàng"}</h2>
              </div>
              <button type="button" onClick={() => setOpenShipModalOrderId(null)} className="rounded-full border border-[#eadad5] px-3 py-2 text-sm font-semibold text-[#6f5752] transition hover:bg-[#faf6f5]">Đóng</button>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div className="rounded-[24px] bg-[#fffaf9] p-4 ring-1 ring-[#f1e5e1]">
                <p className="text-sm font-semibold text-[#4d3a35]">Chọn shipper từ danh sách user có role = shipper</p>
                <select
                  value={selectedShipperId}
                  onChange={(event) => setSelectedShipperId(event.target.value)}
                  className="mt-3 h-12 w-full rounded-2xl border border-[#eadedb] bg-white px-4 text-sm outline-none transition focus:border-[#c62828]"
                >
                  <option value="">-- Chọn shipper --</option>
                  {users.map((user) => (
                    <option key={user.uid} value={user.uid}>
                      {user.ten || user.displayName || user.uid}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm text-[#6f5a55]">
                <span>Tạo shipper xong sẽ cập nhật `nguoi_giao` = UID của shipper</span>
                <span className="rounded-full bg-[#fff7f5] px-3 py-1 text-xs font-semibold text-[#b4534c]">{users.length} shipper</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpenShipModalOrderId(null)}
                  className="flex-1 rounded-2xl border border-[#eadad5] bg-white px-4 py-3 text-sm font-semibold text-[#6f5752] transition hover:bg-[#faf6f5]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={assignShipper}
                  disabled={!selectedShipperId || busyOrderId === openShipModalOrderId}
                  className="flex-1 rounded-2xl bg-[#c62828] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#a61f1f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyOrderId === openShipModalOrderId ? "Đang gán..." : "Xác nhận gán"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
