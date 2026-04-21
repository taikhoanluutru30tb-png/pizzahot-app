"use client";

import { useMemo, useState } from "react";
import {
  CircleCheckBig,
  Clock3,
  Filter,
  MapPin,
  Search,
  ShieldCheck,
  Smartphone,
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
  region: string;
  status: "Online" | "Offline";
  isAvailable: boolean;
  rating: string;
  completed: number;
  avatar: string;
};

const waitingOrders: Order[] = [
  {
    id: "#DH-8829",
    customer: "Nguyễn Văn Nam",
    items: "2x Seafood Deluxe (L), 1x Pepsi 1.5L",
    address: "124 Cách Mạng Tháng 8, Q.3",
    readyAt: "Đã chế biến xong",
    waitTime: "Chờ: 08 phút",
    note: "Ưu tiên giao nhanh vì đơn có đồ uống lạnh.",
  },
  {
    id: "#DH-8833",
    customer: "Trần Minh Tâm",
    items: "1x Meat Lovers (M), 1x Garlic Bread",
    address: "45 Lê Lợi, Q.1",
    readyAt: "Đã chế biến xong",
    waitTime: "Chờ: 12 phút",
    note: "Khách đang chờ tại sảnh tòa nhà.",
  },
  {
    id: "#DH-8831",
    customer: "Lê Hoàng Long",
    items: "3x Cheese Mania (S)",
    address: "89 Nguyễn Huệ, Q.1",
    readyAt: "Đã chế biến xong",
    waitTime: "Chờ: 15 phút",
    note: "Có thể gộp cùng tuyến trung tâm nếu cần.",
  },
];

const shippers: Shipper[] = [
  {
    id: "shipper-01",
    name: "Nguyễn Văn Nam",
    vehicle: "Xe máy • AB 59-123.45",
    region: "Phạm vi: Quận 1, 3, 10",
    status: "Online",
    isAvailable: true,
    rating: "4.9",
    completed: 128,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80",
  },
  {
    id: "shipper-02",
    name: "Trần Minh Tâm",
    vehicle: "Xe máy • 54H2-882.91",
    region: "Phạm vi: Quận 1, 4, 7",
    status: "Online",
    isAvailable: true,
    rating: "4.8",
    completed: 96,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&q=80",
  },
  {
    id: "shipper-03",
    name: "Lê Hoàng Long",
    vehicle: "Xe máy • 59K1-777.02",
    region: "Phạm vi: Quận 5, 6, 11",
    status: "Offline",
    isAvailable: false,
    rating: "4.7",
    completed: 74,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=128&q=80",
  },
  {
    id: "shipper-04",
    name: "Phạm Quốc Huy",
    vehicle: "Xe máy • 51B3-903.18",
    region: "Phạm vi: Quận 2, Bình Thạnh",
    status: "Online",
    isAvailable: true,
    rating: "5.0",
    completed: 152,
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=128&q=80",
  },
];

export default function AdminDeliveryPage() {
  const [selectedOrderId, setSelectedOrderId] = useState(waitingOrders[0]?.id ?? "");
  const [selectedShipperId, setSelectedShipperId] = useState(shippers[0]?.id ?? "");
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [search, setSearch] = useState("");
  const [assignedMessage, setAssignedMessage] = useState<string>("");

  const selectedOrder = useMemo(() => waitingOrders.find((order) => order.id === selectedOrderId) ?? waitingOrders[0], [selectedOrderId]);
  const visibleShippers = useMemo(() => {
    return shippers.filter((shipper) => {
      const matchesSearch = shipper.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = onlyAvailable ? shipper.isAvailable : true;
      return matchesSearch && matchesStatus;
    });
  }, [onlyAvailable, search]);

  const selectedShipper = useMemo(
    () => shippers.find((shipper) => shipper.id === selectedShipperId) ?? visibleShippers[0] ?? shippers[0],
    [selectedShipperId, visibleShippers],
  );

  const handleAssign = () => {
    if (!selectedOrder || !selectedShipper) return;
    setAssignedMessage(`${selectedOrder.id} đã được điều phối cho ${selectedShipper.name}.`);
  };

  const waitingCount = waitingOrders.length;
  const availableCount = shippers.filter((shipper) => shipper.isAvailable).length;

  return (
    <main className="space-y-5 pb-6 text-[#241615] sm:space-y-6 lg:space-y-8">
      <section className="rounded-[28px] bg-gradient-to-br from-[#fffaf8] via-white to-[#fff4f2] p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] ring-1 ring-[#f0dfda] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b18a83]">Điều phối giao hàng</p>
            <h1 className="text-[1.7rem] font-black tracking-tight text-[#241615] sm:text-[2rem] lg:text-[2.35rem]">
              Delivery Coordination
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-[#9a7d77] sm:text-base">
              Chọn đơn đã nấu xong, xem shipper đang rảnh và gán đơn nhanh bằng nút Điều phối/Assign ngay trên màn hình.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Đơn chờ giao", value: waitingCount, icon: Clock3 },
              { label: "Shipper rảnh", value: availableCount, icon: Users },
              { label: "Đang online", value: shippers.filter((s) => s.status === "Online").length, icon: Smartphone },
              { label: "Đang sẵn sàng", value: shippers.filter((s) => s.isAvailable).length, icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[22px] border border-[#f0e3df] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(97,39,25,0.04)]">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a88d86]">
                    <Icon className="h-3.5 w-3.5 text-[#c62828]" />
                    {item.label}
                  </div>
                  <div className="mt-2 text-2xl font-black text-[#c62828]">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
        <article className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#c62828]">
                <Truck className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Đơn hàng chờ xếp</span>
              </div>
              <h2 className="mt-2 text-[1.15rem] font-extrabold text-[#251714] sm:text-[1.3rem]">Danh sách đơn đã chế biến xong</h2>
              <p className="mt-1 text-sm text-[#9d7f79]">Chọn 1 đơn để ghép với shipper phù hợp nhất.</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff4f2] px-3 py-2 text-sm font-semibold text-[#c62828]">
              <Sparkles className="h-4 w-4" />
              {waitingCount} đơn đang chờ
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {waitingOrders.map((order) => {
              const active = selectedOrder?.id === order.id;
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`w-full rounded-[24px] border p-4 text-left transition sm:p-5 ${
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
                          Sẵn sàng
                        </span>
                      </div>
                      <h3 className="truncate text-[1.05rem] font-extrabold tracking-tight text-[#2a1d1a] sm:text-[1.1rem]">
                        {order.items}
                      </h3>
                      <div className="flex flex-col gap-1 text-sm text-[#9f827c] sm:flex-row sm:items-center sm:gap-4">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {order.address}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-4 w-4" />
                          {order.waitTime}
                        </span>
                      </div>
                    </div>

                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${active ? "bg-[#c62828] text-white" : "bg-[#f5efee] text-[#8f746f]"}`}>
                      <CircleCheckBig className="h-5 w-5" />
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
          <section className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#c62828]">
                  <Users className="h-5 w-5" />
                  <span className="text-sm font-bold uppercase tracking-[0.2em]">Danh sách Shipper</span>
                </div>
                <h2 className="mt-2 text-[1.15rem] font-extrabold text-[#251714] sm:text-[1.3rem]">Shipper đang rảnh</h2>
              </div>

              <button
                type="button"
                onClick={() => setOnlyAvailable((value) => !value)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  onlyAvailable ? "bg-[#c62828] text-white shadow-[0_10px_22px_rgba(198,40,40,0.18)]" : "bg-[#f5f2f1] text-[#6f5a55]"
                }`}
              >
                <Filter className="h-4 w-4" />
                {onlyAvailable ? "Chỉ online" : "Tất cả"}
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
                    className={`w-full rounded-[22px] border p-3 text-left transition sm:p-4 ${
                      active ? "border-[#c62828] bg-[#fffaf8]" : "border-[#f2e7e4] bg-[#fffdfc] hover:bg-[#fffafa]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#f7eee9]">
                        <img src={shipper.avatar} alt={shipper.name} className="h-full w-full object-cover" />
                        <span
                          className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white ${
                            shipper.isAvailable ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-base font-extrabold text-[#2a1d1a]">{shipper.name}</h3>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              shipper.status === "Online" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                            }`}
                          >
                            {shipper.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[#9f827c]">{shipper.vehicle}</p>
                        <p className="mt-1 text-sm text-[#9f827c]">{shipper.region}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-[#8b6f69]">
                          <span className="rounded-full bg-[#faf5f4] px-2.5 py-1">⭐ {shipper.rating}</span>
                          <span className="rounded-full bg-[#faf5f4] px-2.5 py-1">Hoàn thành {shipper.completed} đơn</span>
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

          <section className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff0ef] text-[#c62828]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#251714]">Phiếu điều phối</h3>
                <p className="text-sm text-[#9d7f79]">Xác nhận gán đơn cho shipper đang chọn</p>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] bg-[#fbf7f6] p-4">
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
                  <p className="truncate text-base font-extrabold text-[#251714]">{selectedShipper?.name ?? "Chưa có shipper"}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAssign}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c62828] px-5 py-3.5 font-bold text-white shadow-[0_12px_24px_rgba(198,40,40,0.22)] transition hover:bg-[#a91f1f]"
              >
                <CircleCheckBig className="h-4 w-4" />
                Điều phối / Assign
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
