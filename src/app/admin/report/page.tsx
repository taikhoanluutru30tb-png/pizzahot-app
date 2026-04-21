"use client";

import { useMemo, useState } from "react";
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
  ArrowDownToLine,
  Banknote,
  CalendarDays,
  ChartSpline,
  CircleDollarSign,
  Filter,
  PiggyBank,
  TrendingUp,
} from "lucide-react";

type TimeFilter = "day" | "month" | "year";

type RevenuePoint = {
  label: string;
  doanhThu: number;
};

type MetricCard = {
  title: string;
  value: string;
  change: string;
  icon: typeof Banknote;
  accent: string;
};

const revenueDataByFilter: Record<TimeFilter, RevenuePoint[]> = {
  day: [
    { label: "00h", doanhThu: 12.5 },
    { label: "03h", doanhThu: 10.2 },
    { label: "06h", doanhThu: 15.8 },
    { label: "09h", doanhThu: 28.4 },
    { label: "12h", doanhThu: 44.1 },
    { label: "15h", doanhThu: 36.3 },
    { label: "18h", doanhThu: 52.6 },
    { label: "21h", doanhThu: 41.8 },
  ],
  month: [
    { label: "T1", doanhThu: 280 },
    { label: "T2", doanhThu: 320 },
    { label: "T3", doanhThu: 295 },
    { label: "T4", doanhThu: 360 },
    { label: "T5", doanhThu: 410 },
    { label: "T6", doanhThu: 455 },
    { label: "T7", doanhThu: 480 },
    { label: "T8", doanhThu: 430 },
    { label: "T9", doanhThu: 515 },
    { label: "T10", doanhThu: 490 },
    { label: "T11", doanhThu: 560 },
    { label: "T12", doanhThu: 620 },
  ],
  year: [
    { label: "2021", doanhThu: 3650 },
    { label: "2022", doanhThu: 4320 },
    { label: "2023", doanhThu: 5120 },
    { label: "2024", doanhThu: 5980 },
    { label: "2025", doanhThu: 6840 },
    { label: "2026", doanhThu: 7290 },
  ],
};

const metricCards: MetricCard[] = [
  {
    title: "Tổng doanh thu",
    value: "42.850.000đ",
    change: "+12.4% so với kỳ trước",
    icon: CircleDollarSign,
    accent: "from-[#c62828] to-[#e45a4a]",
  },
  {
    title: "Lợi nhuận",
    value: "18.920.000đ",
    change: "+8.1% so với kỳ trước",
    icon: TrendingUp,
    accent: "from-[#2e7d32] to-[#4caf50]",
  },
  {
    title: "Chi phí",
    value: "23.930.000đ",
    change: "-3.2% so với kỳ trước",
    icon: PiggyBank,
    accent: "from-[#d97706] to-[#f59e0b]",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminReportPage() {
  const [filter, setFilter] = useState<TimeFilter>("day");
  const revenueData = useMemo(() => revenueDataByFilter[filter], [filter]);

  const summary = useMemo(() => {
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.doanhThu, 0);
    const cost = totalRevenue * 0.56;
    const profit = totalRevenue - cost;

    return {
      totalRevenue,
      profit,
      cost,
    };
  }, [revenueData]);

  return (
    <main className="space-y-5 pb-4 text-[#4b342f] sm:space-y-6 lg:space-y-8">
      <section className="rounded-[28px] border border-[#efdfdc] bg-white p-4 shadow-[0_12px_40px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#b28b84]">Báo cáo tổng hợp</p>
            <h1 className="mt-2 text-[clamp(1.65rem,4vw,2.4rem)] font-black tracking-tight text-[#241614]">Report Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#9b7d78] lg:text-base">Thống kê doanh thu, lợi nhuận và chi phí theo thời gian, tối ưu cho cả desktop và mobile.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:items-end">
            <label className="block">
              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8d6e68]">Bộ lọc thời gian</span>
              <div className="grid grid-cols-3 rounded-2xl bg-[#f7f1ef] p-1 ring-1 ring-[#ead9d4]">
                {[
                  { id: "day", label: "Ngày" },
                  { id: "month", label: "Tháng" },
                  { id: "year", label: "Năm" },
                ].map((item) => {
                  const active = filter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilter(item.id as TimeFilter)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${active ? "bg-[#c62828] text-white shadow-[0_8px_18px_rgba(198,40,40,0.25)]" : "text-[#7f625e] hover:bg-white/80"}`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </label>

            <label className="block min-w-0 sm:min-w-[280px]">
              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8d6e68]">Khoảng thời gian</span>
              <div className="flex items-center gap-3 rounded-2xl border border-[#e6d8d4] bg-[#fcfaf9] px-4 py-3 shadow-sm">
                <CalendarDays className="h-5 w-5 shrink-0 text-[#b07c74]" />
                <input
                  type="text"
                  readOnly
                  value={filter === "day" ? "01/10/2023 - 31/10/2023" : filter === "month" ? "01/01/2026 - 31/12/2026" : "01/01/2021 - 31/12/2026"}
                  className="w-full bg-transparent text-sm font-medium text-[#4d3b37] outline-none"
                />
              </div>
            </label>

            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c62828] px-5 py-3.5 font-bold text-white shadow-[0_12px_24px_rgba(198,40,40,0.22)] transition hover:bg-[#a91f1f]">
              <ArrowDownToLine className="h-4 w-4" />
              Xuất báo cáo (Excel)
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const displayedValue =
            card.title === "Tổng doanh thu"
              ? formatCurrency(summary.totalRevenue * 1000000)
              : card.title === "Lợi nhuận"
                ? formatCurrency(summary.profit * 1000000)
                : formatCurrency(summary.cost * 1000000);

          return (
            <article key={card.title} className="overflow-hidden rounded-[24px] border border-[#efe1dc] bg-white shadow-[0_10px_28px_rgba(97,39,25,0.05)]">
              <div className={`h-1.5 bg-gradient-to-r ${card.accent}`} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#a78b85]">{card.title}</p>
                    <div className="mt-3 text-[1.7rem] font-black tracking-tight text-[#2c1b17] lg:text-[2rem]">{displayedValue}</div>
                    <p className="mt-2 text-sm text-[#9d7f79]">{card.change}</p>
                  </div>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f8f2f1] text-[#c62828]">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
        <article className="rounded-[28px] border border-[#efdfdc] bg-white p-4 shadow-[0_12px_40px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#c62828]">
                <ChartSpline className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Biểu đồ doanh thu</span>
              </div>
              <h2 className="mt-2 text-[1.15rem] font-extrabold text-[#251714] sm:text-[1.3rem]">Đường biểu diễn doanh thu</h2>
              <p className="mt-1 text-sm text-[#9d7f79]">Dữ liệu hardcode theo bộ lọc thời gian hiện tại.</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff4f2] px-3 py-2 text-sm font-semibold text-[#c62828]">
              <Filter className="h-4 w-4" />
              {filter === "day" ? "Theo ngày" : filter === "month" ? "Theo tháng" : "Theo năm"}
            </div>
          </div>

          <div className="h-[300px] sm:h-[360px] lg:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c62828" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#c62828" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1e3df" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#9d7f79", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => `${value}`} tick={{ fill: "#9d7f79", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid #efdeda",
                    background: "rgba(255,255,255,0.98)",
                    boxShadow: "0 18px 40px rgba(97,39,25,0.12)",
                  }}
                  labelStyle={{ color: "#4b342f", fontWeight: 700 }}
                  formatter={(value) => {
                    const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                    return [formatCurrency(numericValue * 1000000), "Doanh thu"];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="doanhThu"
                  stroke="#c62828"
                  strokeWidth={3}
                  fill="url(#revenueFill)"
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
                <Banknote className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#251714]">Tổng kết nhanh</h3>
                <p className="text-sm text-[#9d7f79]">Tổng hợp theo bộ lọc hiện tại</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl bg-[#fcf8f7] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a78b85]">Doanh thu trung bình</p>
                <div className="mt-2 text-2xl font-black text-[#c62828]">{formatCurrency((summary.totalRevenue / revenueData.length) * 1000000)}</div>
              </div>
              <div className="rounded-2xl bg-[#fcf8f7] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a78b85]">Biên lợi nhuận</p>
                <div className="mt-2 text-2xl font-black text-[#2e7d32]">44.0%</div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#efdfdc] bg-white p-4 shadow-[0_12px_40px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
            <h3 className="text-lg font-extrabold text-[#251714]">Ghi chú</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#8f746f]">
              <li className="rounded-2xl bg-[#fcf8f7] p-3">• Dữ liệu đang dùng hardcode để kiểm thử giao diện và biểu đồ.</li>
              <li className="rounded-2xl bg-[#fcf8f7] p-3">• Có thể thay source dữ liệu bằng API hoặc Firestore sau này.</li>
              <li className="rounded-2xl bg-[#fcf8f7] p-3">• Bố cục tự động xếp dọc trên mobile và chia cột trên desktop.</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
