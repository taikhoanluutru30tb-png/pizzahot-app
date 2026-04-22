"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
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

import { db } from "@/app/lib/firebase";

type OrderDoc = {
  id: string;
  khach_hang?: { ten?: string; sdt?: string; dia_chi?: string; ghi_chu?: string };
  danh_sach_mon?: Array<{ name?: string; quantity?: number }>;
  tong_tien?: number;
  trang_thai?: string;
  thoi_gian_tao?: { toDate?: () => Date };
};

type ShipperDoc = {
  id: string;
  ho_ten: string;
  so_dien_thoai?: string;
  email?: string;
  role?: string;
  isAvailable?: boolean;
};

const getStatusLabel = (status?: string) => status ?? "Chờ giao";

export default function AdminDeliveryPage() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [shippers, setShippers] = useState<ShipperDoc[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedShipperId, setSelectedShipperId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("thoi_gian_tao", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as OrderDoc));
        setOrders(items);
      },
      (snapshotError) => setError(snapshotError.message || "Không thể tải đơn hàng."),
    );
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("ho_ten", "asc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as ShipperDoc));
        setShippers(items.filter((user) => String(user.role ?? "").toLowerCase() === "shipper"));
      },
      (snapshotError) => setError(snapshotError.message || "Không thể tải shipper."),
    );
  }, []);

  const waitingOrders = useMemo(
    () => orders.filter((order) => order.trang_thai === "Chờ giao" || order.trang_thai === "Đang nấu"),
    [orders],
  );

  const visibleShippers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return shippers.filter((shipper) => {
      const matchesSearch =
        !keyword ||
        [shipper.ho_ten, shipper.email, shipper.so_dien_thoai].some((value) =>
          String(value ?? "").toLowerCase().includes(keyword),
        );
      const matchesAvailable = onlyAvailable ? shipper.isAvailable !== false : true;
      return matchesSearch && matchesAvailable;
    });
  }, [onlyAvailable, search, shippers]);

  const selectedOrder = waitingOrders.find((order) => order.id === selectedOrderId) ?? waitingOrders[0] ?? null;
  const selectedShipper = visibleShippers.find((shipper) => shipper.id === selectedShipperId) ?? visibleShippers[0] ?? null;

  useEffect(() => {
    if (!selectedOrderId && waitingOrders[0]) setSelectedOrderId(waitingOrders[0].id);
    if (!selectedShipperId && visibleShippers[0]) setSelectedShipperId(visibleShippers[0].id);
  }, [selectedOrderId, selectedShipperId, visibleShippers, waitingOrders]);

  async function handleAssign() {
    setError(null);
    setMessage(null);

    if (!selectedOrder || !selectedShipper) {
      setError("Vui lòng chọn một đơn hàng và một shipper.");
      return;
    }

    try {
      setIsAssigning(true);
      await updateDoc(doc(db, "orders", selectedOrder.id), {
        nguoi_giao: selectedShipper.ho_ten,
        trang_thai: "Đang giao",
      });
      setMessage(`Đã điều phối ${selectedOrder.id} cho ${selectedShipper.ho_ten}.`);
      setSelectedOrderId("");
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "Không thể điều phối đơn hàng.");
    } finally {
      setIsAssigning(false);
    }
  }

  return (
    <main className="space-y-5 pb-6 text-[#241615] sm:space-y-6 lg:space-y-8">
      <section className="rounded-[28px] bg-gradient-to-br from-[#fffaf8] via-white to-[#fff4f2] p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] ring-1 ring-[#f0dfda] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b18a83]">Điều phối giao hàng</p>
            <h1 className="text-[1.7rem] font-black tracking-tight text-[#241615] sm:text-[2rem] lg:text-[2.35rem]">Delivery Coordination</h1>
            <p className="max-w-3xl text-sm leading-6 text-[#9a7d77] sm:text-base">
              Lọc đơn ở trạng thái <span className="font-semibold text-[#6f5752]">Chờ giao</span> hoặc <span className="font-semibold text-[#6f5752]">Đang nấu</span> và điều phối shipper bằng Firestore realtime.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Đơn chờ giao", value: waitingOrders.length, icon: Clock3 },
              { label: "Shipper rảnh", value: shippers.filter((s) => s.isAvailable !== false).length, icon: Users },
              { label: "Đang online", value: shippers.length, icon: Smartphone },
              { label: "Sẵn sàng", value: shippers.filter((s) => s.isAvailable !== false).length, icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[22px] border border-[#f0e3df] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(97,39,25,0.04)]">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a88d86]"><Icon className="h-3.5 w-3.5 text-[#c62828]" />{item.label}</div>
                  <div className="mt-2 text-2xl font-black text-[#c62828]">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-[#f2d1d1] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#b42318]">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-[#d9f0df] bg-[#f3fbf5] px-4 py-3 text-sm font-medium text-[#1f7a39]">{message}</div> : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
        <article className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#c62828]"><Truck className="h-5 w-5" /><span className="text-sm font-bold uppercase tracking-[0.2em]">Đơn hàng chờ xếp</span></div>
              <h2 className="mt-2 text-[1.15rem] font-extrabold text-[#251714] sm:text-[1.3rem]">Danh sách đơn chờ điều phối</h2>
              <p className="mt-1 text-sm text-[#9d7f79]">Chọn đơn bên trái, chọn shipper bên phải rồi bấm Điều phối.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff4f2] px-3 py-2 text-sm font-semibold text-[#c62828]"><Sparkles className="h-4 w-4" />{waitingOrders.length} đơn</div>
          </div>

          <div className="mt-5 space-y-3">
            {waitingOrders.map((order) => {
              const active = selectedOrder?.id === order.id;
              return (
                <button key={order.id} type="button" onClick={() => setSelectedOrderId(order.id)} className={`w-full rounded-[24px] border p-4 text-left transition sm:p-5 ${active ? "border-[#c62828] bg-[#fffaf8] shadow-[0_10px_24px_rgba(198,40,40,0.08)]" : "border-[#f1e5e1] bg-[#fffdfc] hover:border-[#e4c6c0] hover:bg-[#fffafa]"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-[#c62828]">Mã: {order.id}</p><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">{getStatusLabel(order.trang_thai)}</span></div>
                      <h3 className="truncate text-[1.05rem] font-extrabold tracking-tight text-[#2a1d1a] sm:text-[1.1rem]">{order.khach_hang?.ten ?? "Khách hàng"}</h3>
                      <div className="flex flex-col gap-1 text-sm text-[#9f827c] sm:flex-row sm:items-center sm:gap-4"><span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{order.khach_hang?.dia_chi ?? "Chưa có địa chỉ"}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{order.thoi_gian_tao?.toDate ? order.thoi_gian_tao.toDate().toLocaleString("vi-VN") : "Chưa có thời gian"}</span></div>
                    </div>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${active ? "bg-[#c62828] text-white" : "bg-[#f5efee] text-[#8f746f]"}`}><CircleCheckBig className="h-5 w-5" /></div>
                  </div>
                  <div className="mt-4 rounded-[18px] bg-[#faf7f6] px-4 py-3"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#aa9089]">Ghi chú</p><p className="mt-1 text-sm text-[#6b5751]">{order.khach_hang?.ghi_chu || "Không có ghi chú"}</p></div>
                </button>
              );
            })}

            {waitingOrders.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[#eadbd7] bg-[#fffafa] px-4 py-8 text-center text-sm text-[#9a7d77]">Không có đơn hàng nào đang chờ giao hoặc đang nấu.</div>
            ) : null}
          </div>
        </article>

        <aside className="space-y-4">
          <section className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#c62828]"><Users className="h-5 w-5" /><span className="text-sm font-bold uppercase tracking-[0.2em]">Danh sách Shipper</span></div>
                <h2 className="mt-2 text-[1.15rem] font-extrabold text-[#251714] sm:text-[1.3rem]">Shipper đang rảnh</h2>
              </div>
              <button type="button" onClick={() => setOnlyAvailable((value) => !value)} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${onlyAvailable ? "bg-[#c62828] text-white shadow-[0_10px_22px_rgba(198,40,40,0.18)]" : "bg-[#f5f2f1] text-[#6f5a55]"}`}><Filter className="h-4 w-4" />{onlyAvailable ? "Chỉ online" : "Tất cả"}</button>
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[#e8dbd7] bg-[#fcfaf9] px-4 py-3 shadow-sm"><Search className="h-5 w-5 shrink-0 text-[#b07c74]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm shipper..." className="w-full bg-transparent text-sm font-medium text-[#4d3b37] outline-none placeholder:text-[#bda8a3]" /></label>

            <div className="mt-4 space-y-3">
              {visibleShippers.map((shipper) => {
                const active = selectedShipper?.id === shipper.id;
                return (
                  <button key={shipper.id} type="button" onClick={() => setSelectedShipperId(shipper.id)} className={`w-full rounded-[22px] border p-3 text-left transition sm:p-4 ${active ? "border-[#c62828] bg-[#fffaf8]" : "border-[#f2e7e4] bg-[#fffdfc] hover:bg-[#fffafa]"}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#f7eee9]">
                        <span className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white ${shipper.isAvailable !== false ? "bg-emerald-500" : "bg-slate-400"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2"><h3 className="truncate text-base font-extrabold text-[#2a1d1a]">{shipper.ho_ten}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${shipper.isAvailable !== false ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"}`}>{shipper.isAvailable !== false ? "Sẵn sàng" : "Bận"}</span></div>
                        <p className="mt-1 text-sm text-[#9f827c]">{shipper.email}</p>
                        <p className="mt-1 text-sm text-[#9f827c]">{shipper.so_dien_thoai}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {visibleShippers.length === 0 ? <div className="rounded-[22px] border border-dashed border-[#eadbd7] bg-[#fffafa] px-4 py-8 text-center text-sm text-[#9a7d77]">Không tìm thấy shipper phù hợp.</div> : null}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
            <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff0ef] text-[#c62828]"><Zap className="h-5 w-5" /></div><div><h3 className="text-lg font-extrabold text-[#251714]">Điều phối đơn</h3><p className="text-sm text-[#9d7f79]">Gán đơn cho shipper đang chọn</p></div></div>
            <div className="mt-5 rounded-[22px] bg-[#fbf7f6] p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a78b85]">Đơn hàng</p><p className="mt-1 text-lg font-black text-[#c62828]">{selectedOrder?.id ?? "Chưa chọn"}</p></div><Truck className="h-5 w-5 text-[#c62828]" /></div>
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-[#edded9]"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#fff0ef] text-[#c62828]"><UserRound className="h-5 w-5" /></div><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a78b85]">Shipper</p><p className="truncate text-base font-extrabold text-[#251714]">{selectedShipper?.ho_ten ?? "Chưa chọn shipper"}</p></div></div>
              <button type="button" onClick={handleAssign} disabled={isAssigning} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c62828] px-5 py-3.5 font-bold text-white shadow-[0_12px_24px_rgba(198,40,40,0.22)] transition hover:bg-[#a91f1f] disabled:cursor-not-allowed disabled:opacity-70">{isAssigning ? "Đang điều phối..." : "Điều phối"}</button>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
