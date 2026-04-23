"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  PackageCheck,
  Search,
  Sparkles,
  Truck,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

type Order = {
  id: string;
  customer: string;
  items: string;
  address: string;
  readyAt: string;
  waitTime: string;
  note: string;
};

type Shipper = {
  id: string;
  name: string;
  vehicle: string;
  phone: string;
  status: "Đang chờ" | "Đang giao";
  isAvailable: boolean;
  rating: string;
  avatar: string;
};

const readyOrders: Order[] = [
  {
    id: "#DH-2941",
    customer: "Nguyễn Văn Nam",
    items: "Pizza Hải Sản Pesto",
    address: "45 Lê Lợi, Quận 1, TP.HCM",
    readyAt: "Đã chế biến xong",
    waitTime: "Chờ: 08 phút",
    note: "Đơn có đồ uống lạnh, ưu tiên giao ngay.",
  },
  {
    id: "#DH-2945",
    customer: "Trần Minh Tâm",
    items: "Bún Chả Hà Nội (Combo 2)",
    address: "120 Nguyễn Huệ, Quận 1",
    readyAt: "Đã chế biến xong",
    waitTime: "Chờ: 12 phút",
    note: "Khách đang đứng ở sảnh, dễ bàn giao nhanh.",
  },
  {
    id: "#DH-2948",
    customer: "Lê Hoàng Long",
    items: "Mỳ Ý Carbonara + Coca 1.5L",
    address: "89 Nguyễn Trãi, Quận 5",
    readyAt: "Đã chế biến xong",
    waitTime: "Chờ: 15 phút",
    note: "Có thể ghép shipper tuyến Quận 5 trước.",
  },
];

const shippers: Shipper[] = [
  {
    id: "shipper-01",
    name: "Trần Minh Quân",
    vehicle: "Xe máy • 59A1-128.90",
    phone: "0901 234 567",
    status: "Đang chờ",
    isAvailable: true,
    rating: "4.9",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80",
  },
  {
    id: "shipper-02",
    name: "Lê Hoàng Nam",
    vehicle: "Xe máy • 54H2-882.91",
    phone: "0912 345 678",
    status: "Đang chờ",
    isAvailable: true,
    rating: "4.8",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&q=80",
  },
  {
    id: "shipper-03",
    name: "Nguyễn Văn Ba",
    vehicle: "Xe máy • 59K1-777.02",
    phone: "0933 456 789",
    status: "Đang giao",
    isAvailable: true,
    rating: "4.7",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=128&q=80",
  },
];

export default function StaffDeliveryPage() {
  const [selectedOrderId, setSelectedOrderId] = useState(readyOrders[0]?.id ?? "");
  const [selectedShipperId, setSelectedShipperId] = useState(shippers[0]?.id ?? "");
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [search, setSearch] = useState("");
  const [assignedMessage, setAssignedMessage] = useState("");

  const selectedOrder = useMemo(
    () => readyOrders.find((order) => order.id === selectedOrderId) ?? readyOrders[0],
    [selectedOrderId],
  );

  const visibleShippers = useMemo(() => {
    return shippers.filter((shipper) => {
      const matchesSearch = shipper.name.toLowerCase().includes(search.toLowerCase());
      const matchesAvailability = onlyAvailable ? shipper.isAvailable : true;
      return matchesSearch && matchesAvailability;
    });
  }, [onlyAvailable, search]);

  const selectedShipper = useMemo(
    () => shippers.find((shipper) => shipper.id === selectedShipperId) ?? visibleShippers[0] ?? shippers[0],
    [selectedShipperId, visibleShippers],
  );

  const handleAssign = () => {
    if (!selectedOrder || !selectedShipper) return;
    setAssignedMessage(`${selectedOrder.id} đã được giao cho ${selectedShipper.name}.`);
  };

  const readyCount = readyOrders.length;
  const availableCount = shippers.filter((shipper) => shipper.isAvailable).length;

  return (
    <main className="space-y-4 pb-6 text-[#241615] sm:space-y-5 lg:space-y-6">
      <section className="rounded-[26px] bg-gradient-to-br from-[#fff8f6] to-white p-4 shadow-[0_12px_32px_rgba(97,39,25,0.06)] ring-1 ring-[#f0dfda] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b18a83]">Nhân viên quầy</p>
            <h1 className="text-[1.8rem] font-black tracking-tight text-[#241615] sm:text-[2.1rem]">Đơn hàng chờ bàn giao</h1>
            <p className="max-w-2xl text-sm leading-6 text-[#987b75] sm:text-base">
              Chọn 1 đơn vừa xong, chọn shipper đang đứng chờ tại quán, rồi bấm nút giao thật to để thao tác nhanh trên tablet / mobile.
            </p>
          </div>
          <div className="hidden rounded-2xl bg-white px-4 py-3 text-right shadow-sm ring-1 ring-[#f0e4e0] sm:block">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a98b84]">Sẵn sàng</p>
            <p className="text-2xl font-black text-[#c62828]">{readyCount}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Đơn vừa xong", value: readyCount, icon: PackageCheck },
            { label: "Shipper tại quán", value: shippers.length, icon: Users },
            { label: "Có thể giao ngay", value: availableCount, icon: Truck },
            { label: "Đang chờ xác nhận", value: 1, icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-[20px] border border-[#f0e3df] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(97,39,25,0.04)]">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a88d86]">
                  <Icon className="h-3.5 w-3.5 text-[#c62828]" />
                  {item.label}
                </div>
                <div className="mt-2 text-2xl font-black text-[#c62828]">{item.value}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.85fr)]">
        <article className="rounded-[26px] border border-[#efe2df] bg-white p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#c62828]">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Đơn hàng chờ xếp</span>
              </div>
              <h2 className="mt-2 text-[1.15rem] font-extrabold text-[#251714] sm:text-[1.3rem]">Chọn đơn đã làm xong</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff4f2] px-3 py-2 text-sm font-semibold text-[#c62828]">
              <Sparkles className="h-4 w-4" />
              {readyCount} đơn đang chờ
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {readyOrders.map((order) => {
              const active = selectedOrder?.id === order.id;
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`w-full rounded-[24px] border p-4 text-left transition active:scale-[0.99] sm:p-5 ${
                    active
                      ? "border-[#c62828] bg-[#fffaf8] shadow-[0_10px_24px_rgba(198,40,40,0.08)]"
                      : "border-[#f1e5e1] bg-[#fffdfc] hover:border-[#e4c6c0] hover:bg-[#fffafa]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-[#c62828]">Mã: {order.id}</p>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                          {order.readyAt}
                        </span>
                      </div>
                      <h3 className="truncate text-[1.06rem] font-extrabold tracking-tight text-[#2a1d1a]">{order.items}</h3>
                      <p className="text-sm font-medium text-[#8f6f69]">Khách: {order.customer}</p>
                      <div className="flex flex-col gap-1 text-sm text-[#9f827c] sm:flex-row sm:items-center sm:gap-4">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {order.address}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {order.waitTime}
                        </span>
                      </div>
                    </div>
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${active ? "bg-[#c62828] text-white" : "bg-[#f5efee] text-[#8f746f]"}`}>
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-4 rounded-[18px] bg-[#faf7f6] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#aa9089]">Ghi chú</p>
                    <p className="mt-1 text-sm text-[#6b5751]">{order.note}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <aside className="space-y-4">
          <section className="rounded-[26px] border border-[#efe2df] bg-white p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#c62828]">
                  <Users className="h-5 w-5" />
                  <span className="text-sm font-bold uppercase tracking-[0.2em]">Danh sách Shipper</span>
                </div>
                <h2 className="mt-2 text-[1.15rem] font-extrabold text-[#251714] sm:text-[1.3rem]">Shipper đang đứng chờ</h2>
              </div>

              <button
                type="button"
                onClick={() => setOnlyAvailable((value) => !value)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  onlyAvailable ? "bg-[#c62828] text-white shadow-[0_10px_22px_rgba(198,40,40,0.18)]" : "bg-[#f5f2f1] text-[#6f5a55]"
                }`}
              >
                <Filter className="h-4 w-4" />
                {onlyAvailable ? "Chỉ rảnh" : "Tất cả"}
              </button>
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[#e8dbd7] bg-[#fcfaf9] px-4 py-3 shadow-sm">
              <Search className="h-5 w-5 shrink-0 text-[#b07c74]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm shipper..."
                className="w-full bg-transparent text-sm font-medium text-[#4d3b37] outline-none placeholder:text-[#bda8a3]"
              />
            </label>

            <div className="mt-4 space-y-3">
              {visibleShippers.map((shipper) => {
                const active = selectedShipper?.id === shipper.id;
                return (
                  <button
                    key={shipper.id}
                    type="button"
                    onClick={() => setSelectedShipperId(shipper.id)}
                    className={`w-full rounded-[22px] border p-3 text-left transition active:scale-[0.99] sm:p-4 ${
                      active ? "border-[#c62828] bg-[#fffaf8]" : "border-[#f2e7e4] bg-[#fffdfc] hover:bg-[#fffafa]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#f7eee9]">
                        <img src={shipper.avatar} alt={shipper.name} className="h-full w-full object-cover" />
                        <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-base font-extrabold text-[#2a1d1a]">{shipper.name}</h3>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                            {shipper.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[#9f827c]">{shipper.vehicle}</p>
                        <p className="mt-1 text-sm text-[#9f827c]">{shipper.phone}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-[#8b6f69]">
                          <span className="rounded-full bg-[#faf5f4] px-2.5 py-1">⭐ {shipper.rating}</span>
                          <span className="rounded-full bg-[#faf5f4] px-2.5 py-1">Đang có mặt tại quán</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {visibleShippers.length === 0 && (
                <div className="rounded-[22px] border border-dashed border-[#eadbd7] bg-[#fffafa] px-4 py-8 text-center text-sm text-[#9a7d77]">
                  Không tìm thấy shipper phù hợp.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[26px] border border-[#efe2df] bg-white p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff0ef] text-[#c62828]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#251714]">Xác nhận giao nhanh</h3>
                <p className="text-sm text-[#9d7f79]">Chạm nút lớn để bàn giao ngay tại quầy</p>
              </div>
            </div>

            <div className="mt-4 rounded-[22px] bg-[#fbf7f6] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a78b85]">Đơn hàng</p>
                  <p className="mt-1 text-lg font-black text-[#c62828]">{selectedOrder?.id}</p>
                </div>
                <Truck className="h-5 w-5 text-[#c62828]" />
              </div>

              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-[#edded9]">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#fff0ef] text-[#c62828]">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a78b85]">Shipper được chọn</p>
                  <p className="truncate text-base font-extrabold text-[#251714]">{selectedShipper?.name ?? "Chưa chọn shipper"}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAssign}
                className="mt-4 inline-flex min-h-[60px] w-full items-center justify-center gap-2 rounded-[20px] bg-[#c62828] px-5 py-4 text-[1.02rem] font-black text-white shadow-[0_14px_28px_rgba(198,40,40,0.24)] transition hover:bg-[#a91f1f] active:scale-[0.99]"
              >
                <PackageCheck className="h-5 w-5" />
                Giao cho Shipper này
              </button>

              {assignedMessage && (
                <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
                  {assignedMessage}
                </p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
