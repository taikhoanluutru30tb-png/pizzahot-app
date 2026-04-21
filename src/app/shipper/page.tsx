"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Navigation2,
  Package2,
  Phone,
  Truck,
  UserRound,
} from "lucide-react";

type TransitOrder = {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  codAmount: string;
  deliveryAddress: string;
  shortAddress: string;
  distance: string;
  status: string;
  eta: string;
  items: string[];
};

const ORDERS: TransitOrder[] = [
  {
    id: "#PH-2941",
    orderCode: "EV-9921",
    customerName: "Nguyễn Văn An",
    customerPhone: "0908 123 456",
    codAmount: "450.000đ",
    deliveryAddress: "Căn hộ B1.05, Vinhomes Central Park, P.22, Q.Bình Thạnh",
    shortAddress: "Vinhomes Central Park, Q.Bình Thạnh",
    distance: "1.2 km còn lại",
    status: "Đang di chuyển",
    eta: "Dự kiến 12:45",
    items: ["Phở bò đặc biệt (Size L)", "Bún chả Hà Nội (Combo)", "Cà phê sữa đá x3"],
  },
  {
    id: "#PH-2942",
    orderCode: "EV-9950",
    customerName: "Trần Thị Bích",
    customerPhone: "0933 456 789",
    codAmount: "320.000đ",
    deliveryAddress: "45 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
    shortAddress: "45 Lê Lợi, Quận 1",
    distance: "800 m còn lại",
    status: "Sắp tới nơi",
    eta: "Dự kiến 13:10",
    items: ["Pizza Hải Sản size M", "Khoai tây chiên phô mai", "Coca Cola 1.5L"],
  },
  {
    id: "#PH-2943",
    orderCode: "EV-9958",
    customerName: "Lê Hoàng Nam",
    customerPhone: "0912 888 777",
    codAmount: "180.000đ",
    deliveryAddress: "Chung cư Sunrise City View, Đường Nguyễn Hữu Thọ, Quận 7",
    shortAddress: "Sunrise City View, Quận 7",
    distance: "2.4 km còn lại",
    status: "Đang di chuyển",
    eta: "Dự kiến 13:25",
    items: ["Mì Ý bò bằm", "Salad Caesar", "Trà chanh mật ong"],
  },
  {
    id: "#PH-2944",
    orderCode: "EV-9964",
    customerName: "Phạm Minh Khang",
    customerPhone: "0987 321 654",
    codAmount: "560.000đ",
    deliveryAddress: "128 Nguyễn Thái Học, Phường Cầu Ông Lãnh, Quận 1",
    shortAddress: "128 Nguyễn Thái Học, Quận 1",
    distance: "1.8 km còn lại",
    status: "Đang di chuyển",
    eta: "Dự kiến 13:40",
    items: ["Combo gà rán 6 miếng", "Burger bò phô mai", "Nước suối", "Kem vani"],
  },
];

function OrderCard({ order }: { order: TransitOrder }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-[#f4e3df] bg-white shadow-[0_16px_50px_rgba(17,24,39,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(17,24,39,0.12)]">
      <div className="bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#fb923c] px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-white/90">
              <Truck className="h-3.5 w-3.5" />
              {order.status}
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight">{order.id}</h2>
            <p className="mt-1 text-sm text-white/85">Mã đơn: {order.orderCode}</p>
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
              <p className="text-2xl font-black tracking-tight text-[#3c2b28]">{order.customerName}</p>
              <p className="text-lg font-semibold text-[#5b4541]">{order.customerPhone}</p>
            </div>
          </div>

          <div className="rounded-[22px] bg-[#dc2626] p-4 text-white shadow-[0_12px_30px_rgba(220,38,38,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70">Số tiền thu hộ</div>
                <p className="mt-3 text-4xl font-black tracking-tight">{order.codAmount}</p>
              </div>
              <Phone className="h-8 w-8 text-white/80" />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-white/75">
              <span>{order.distance}</span>
              <span>{order.eta}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] bg-[#fffaf9] p-4 ring-1 ring-[#f4e3df]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#9b756f]">
            <MapPin className="h-4 w-4 text-[#dc2626]" />
            Địa chỉ giao hàng
          </div>
          <p className="mt-3 text-[1.15rem] font-bold leading-relaxed text-[#3f2f2c] sm:text-[1.25rem]">{order.deliveryAddress}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#8b6f6a]">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium ring-1 ring-[#eadbd8]">
              <Navigation2 className="h-3.5 w-3.5 text-[#dc2626]" />
              {order.shortAddress}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium ring-1 ring-[#eadbd8]">
              <CalendarDays className="h-3.5 w-3.5 text-[#dc2626]" />
              {order.eta}
            </span>
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-4 ring-1 ring-[#f4e3df]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-bold uppercase tracking-[0.24em] text-[#9b756f]">Danh sách món</div>
            <span className="rounded-full bg-[#fff1f0] px-3 py-1 text-xs font-bold text-[#dc2626] ring-1 ring-[#fecaca]">
              {order.items.length} món
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {order.items.map((item, index) => (
              <div key={item} className="flex items-start justify-between gap-4 border-b border-[#f5e8e6] pb-3 last:border-b-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[1.02rem] font-semibold text-[#4e3935]">{item}</p>
                  <p className="mt-1 text-xs text-[#a38c87]">Món {index + 1}</p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#d7b5af]" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href={`tel:${order.customerPhone.replace(/\s/g, "")}`}
            className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#fff7f5] px-4 py-4 text-base font-bold text-[#8b4c46] ring-1 ring-[#f2d7d3] transition active:scale-[0.99] sm:min-h-[60px]"
          >
            <Phone className="h-5 w-5" />
            Gọi điện
          </a>
          <button
            type="button"
            className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#dc2626] px-4 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(220,38,38,0.22)] transition hover:bg-[#b91c1c] active:scale-[0.99] sm:min-h-[60px]"
          >
            <CheckCircle2 className="h-5 w-5" />
            Đã giao xong
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ShipperTransitPage() {
  return (
    <div className="space-y-6 pb-4">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#fff7f5] via-white to-[#fff1ee] p-5 shadow-[0_16px_50px_rgba(17,24,39,0.05)] ring-1 ring-[#f3e1dd] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1f0] px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-[#dc2626] ring-1 ring-[#fecaca]">
              <Bell className="h-3.5 w-3.5" />
              Shipper dashboard
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#3f2f2c] sm:text-5xl">Đơn hàng đang giao</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7f625d] sm:text-base">
              Danh sách đơn đang trong quá trình giao, ưu tiên hiển thị rõ số tiền thu hộ, địa chỉ giao hàng và thông tin khách hàng để thao tác nhanh trên mobile.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-3xl bg-white p-4 ring-1 ring-[#f2dfdb]">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b756f]">Tổng đơn</p>
              <p className="mt-2 text-3xl font-black text-[#dc2626]">{ORDERS.length}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 ring-1 ring-[#f2dfdb]">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b756f]">Đang xử lý</p>
              <p className="mt-2 text-3xl font-black text-[#3f2f2c]">{ORDERS.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {ORDERS.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </section>

      <div className="rounded-[24px] bg-[#fff7f5] px-5 py-4 text-sm text-[#8a6d68] ring-1 ring-[#f4e3df]">
        <Link href="/shipper/delivered" className="inline-flex items-center gap-2 font-semibold text-[#dc2626] hover:underline">
          Xem báo cáo đơn đã giao
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
