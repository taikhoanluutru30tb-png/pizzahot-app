import {
  ArrowUpRight,
  Banknote,
  CalendarRange,
  Clock3,
  LineChart,
  Package,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

type MetricCard = {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof Banknote;
  bgClass: string;
  iconClass: string;
  valueClass: string;
};

type RevenuePoint = {
  label: string;
  value: number;
};

type BestSeller = {
  name: string;
  percent: number;
  sales: string;
};

type OrderItem = {
  id: string;
  customer: string;
  detail: string;
  price: string;
  status: string;
};

const metrics: MetricCard[] = [
  {
    title: "Tổng doanh thu",
    value: "128.500.000đ",
    subtitle: "+12,8% so với hôm qua",
    icon: Banknote,
    bgClass: "bg-[#c62828] text-white",
    iconClass: "bg-white/15 text-white",
    valueClass: "text-white",
  },
  {
    title: "Tổng đơn hàng",
    value: "1.248",
    subtitle: "+84 đơn trong tuần",
    icon: ShoppingCart,
    bgClass: "bg-white text-[#4b3a37]",
    iconClass: "bg-[#f7e8e7] text-[#c62828]",
    valueClass: "text-[#241615]",
  },
  {
    title: "Tổng khách hàng",
    value: "832",
    subtitle: "+46 khách mới",
    icon: Users,
    bgClass: "bg-white text-[#4b3a37]",
    iconClass: "bg-[#f3ede8] text-[#7c4d2f]",
    valueClass: "text-[#241615]",
  },
  {
    title: "Tổng tiền ship",
    value: "32 triệu",
    subtitle: "Phí vận chuyển tháng này",
    icon: Wallet,
    bgClass: "bg-white text-[#4b3a37]",
    iconClass: "bg-[#eef4ff] text-[#1d4ed8]",
    valueClass: "text-[#241615]",
  },
  {
    title: "Đơn đang xử lý",
    value: "26",
    subtitle: "Cần xác nhận / đóng gói",
    icon: Clock3,
    bgClass: "bg-white text-[#4b3a37]",
    iconClass: "bg-[#fff3e8] text-[#d97706]",
    valueClass: "text-[#241615]",
  },
  {
    title: "Món bán chạy",
    value: "18",
    subtitle: "Sản phẩm có doanh số cao",
    icon: Package,
    bgClass: "bg-white text-[#4b3a37]",
    iconClass: "bg-[#edf9ef] text-[#15803d]",
    valueClass: "text-[#241615]",
  },
];

const revenueData: RevenuePoint[] = [
  { label: "T2", value: 42 },
  { label: "T3", value: 55 },
  { label: "T4", value: 48 },
  { label: "T5", value: 72 },
  { label: "T6", value: 68 },
  { label: "T7", value: 96 },
  { label: "CN", value: 82 },
];

const bestSellers: BestSeller[] = [
  { name: "Pizza Hải Sản", percent: 45, sales: "432 bán" },
  { name: "Salad Cá Hồi Đặc Biệt", percent: 28, sales: "243 bán" },
  { name: "Pasta Hải Sản Sốt Kem", percent: 21, sales: "198 bán" },
];

const pendingOrders: OrderItem[] = [
  {
    id: "#100",
    customer: "Nguyễn Văn A",
    detail: "2x Bánh Mì Thịt Nướng, 1x Trà Đào Cam Sả",
    price: "185.000đ",
    status: "Đang chuẩn bị",
  },
  {
    id: "#101",
    customer: "Trần Thị B",
    detail: "1x Combo Gia Đình, 4x Coca Cola",
    price: "450.000đ",
    status: "Chờ tài xế",
  },
  {
    id: "#102",
    customer: "Lê Minh C",
    detail: "3x Pizza Hải Sản, 2x Salad Caesar",
    price: "620.000đ",
    status: "Đang giao",
  },
];

function RevenueChart() {
  const max = Math.max(...revenueData.map((item) => item.value));

  return (
    <div className="rounded-[28px] border border-[#efe2df] bg-white p-5 shadow-[0_10px_30px_rgba(97,39,25,0.06)] lg:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.05rem] font-extrabold text-[#2f1f1b] lg:text-[1.15rem]">Thống kê doanh thu</h2>
          <p className="mt-1 text-sm text-[#9a7d77]">Doanh thu 7 ngày gần nhất</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#fff4f3] px-3 py-2 text-sm font-semibold text-[#c62828]">
          <LineChart className="h-4 w-4" />
          +18.2%
        </div>
      </div>

      <div className="h-[260px] lg:h-[310px]">
        <div className="flex h-full items-end gap-3 sm:gap-4">
          {revenueData.map((item) => {
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
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="flex flex-col gap-4 rounded-[30px] bg-[#fff9f7] p-4 shadow-[0_12px_40px_rgba(97,39,25,0.05)] ring-1 ring-[#f0dfda] lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b08d85]">Chào buổi sáng</p>
          <h1 className="mt-2 text-[1.9rem] font-black tracking-tight text-[#231714] lg:text-[2.5rem]">Admin, xin chào!</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#9f827c] lg:text-base">Dưới đây là tóm tắt hoạt động hôm nay của Pizza Hot.</p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[#c62828] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(198,40,40,0.25)] transition hover:bg-[#a91f1f]">
          <CalendarRange className="h-4 w-4" />
          Chốt Ca
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.title}
              className={`rounded-[26px] border border-[#efe2df] p-5 shadow-[0_10px_28px_rgba(97,39,25,0.06)] ${metric.bgClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${metric.valueClass === "text-white" ? "text-white/85" : "text-[#a78c86]"}`}>
                    {metric.title}
                  </p>
                  <div className={`mt-4 text-[2rem] font-black tracking-tight ${metric.valueClass} lg:text-[2.35rem]`}>{metric.value}</div>
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

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <RevenueChart />
        </div>

        <aside className="rounded-[28px] border border-[#efe2df] bg-white p-5 shadow-[0_10px_30px_rgba(97,39,25,0.06)] lg:p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[1.05rem] font-extrabold text-[#2f1f1b] lg:text-[1.15rem]">Sản phẩm bán chạy nhất</h2>
              <p className="mt-1 text-sm text-[#9a7d77]">Top món theo doanh thu</p>
            </div>
            <span className="rounded-full bg-[#fff4f3] px-3 py-1 text-xs font-bold text-[#c62828]">Hot</span>
          </div>

          <div className="space-y-4">
            {bestSellers.map((item) => (
              <div key={item.name} className="space-y-2 rounded-[22px] bg-[#fcf9f8] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#2f1f1b]">{item.name}</p>
                    <p className="text-sm text-[#a78c86]">{item.sales}</p>
                  </div>
                  <p className="text-lg font-black text-[#c62828]">{item.percent}%</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#efe6e4]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#c62828] to-[#e15b45]" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="rounded-[28px] border border-[#efe2df] bg-white p-5 shadow-[0_10px_30px_rgba(97,39,25,0.06)] lg:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[1.05rem] font-extrabold text-[#2f1f1b] lg:text-[1.15rem]">Đơn hàng chưa giao</h2>
            <p className="mt-1 text-sm text-[#9a7d77]">Danh sách các đơn đang chờ xử lý</p>
          </div>
          <button className="inline-flex items-center gap-2 text-sm font-bold text-[#c62828]">
            Xem tất cả
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <article key={order.id} className="rounded-[22px] border border-[#f1e5e1] bg-[#fffdfc] p-4 shadow-[0_8px_20px_rgba(97,39,25,0.04)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff2f0] text-sm font-black text-[#c62828]">
                    {order.id}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-[#2f1f1b]">{order.customer}</h3>
                      <span className="rounded-full bg-[#fff1df] px-3 py-1 text-xs font-bold text-[#9a6420]">{order.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#9f827c]">{order.detail}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:text-right">
                  <div className="text-lg font-black text-[#c62828]">{order.price}</div>
                  <div className="text-sm font-medium text-[#aa8f89]">Đang chờ</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
