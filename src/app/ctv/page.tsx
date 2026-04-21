import { BarChart3, Coins, ShoppingBag, UserCircle2 } from "lucide-react";

type StatCard = {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof BarChart3;
  iconClassName: string;
  cardClassName: string;
};

const stats: StatCard[] = [
  {
    title: "Tổng doanh thu",
    value: "8.450.000đ",
    subtitle: "Doanh thu tích lũy trong tháng",
    icon: BarChart3,
    iconClassName: "text-sky-500",
    cardClassName: "bg-white",
  },
  {
    title: "Số đơn thành công",
    value: "482",
    subtitle: "Đơn đã hoàn tất và thanh toán",
    icon: ShoppingBag,
    iconClassName: "text-violet-500",
    cardClassName: "bg-white",
  },
  {
    title: "Hoa hồng tạm tính",
    value: "1.250.000đ",
    subtitle: "Dự kiến nhận trong kỳ này",
    icon: Coins,
    iconClassName: "text-red-500",
    cardClassName: "bg-gradient-to-br from-[#b91c1c] to-[#ef4444] text-white",
  },
];

export default function CtvPage() {
  return (
    <section className="space-y-6 lg:space-y-8">
      <header className="flex items-center justify-between gap-4 rounded-[28px] bg-white px-5 py-5 shadow-sm ring-1 ring-black/5 lg:px-8 lg:py-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#b4534c]">
            Dashboard CTV
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#3f2723] lg:text-4xl">
            Xin chào, Nguyễn Văn A
          </h1>
          <p className="max-w-xl text-sm text-[#8d6a64] lg:text-base">
            Chào mừng bạn quay lại. Đây là tổng quan nhanh về doanh thu, đơn hàng và hoa hồng của
            bạn hôm nay.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-full bg-[#fff7f5] px-3 py-2 shadow-inner ring-1 ring-[#f0d7d2]">
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#dc2626] to-[#fb7185] text-white shadow-sm">
            <UserCircle2 className="h-7 w-7" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-[#4b2d29]">CTV</div>
            <div className="text-xs text-[#9a746d]">Đang hoạt động</div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className={`rounded-[28px] p-5 shadow-sm ring-1 ring-black/5 lg:p-6 ${item.cardClassName}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${item.cardClassName.includes("text-white") ? "text-white/80" : "text-[#9c6a62]"}`}>
                    {item.title}
                  </p>
                  <div className={`text-3xl font-extrabold tracking-tight lg:text-4xl ${item.cardClassName.includes("text-white") ? "text-white" : "text-[#3d231f]"}`}>
                    {item.value}
                  </div>
                  <p className={`text-sm ${item.cardClassName.includes("text-white") ? "text-white/80" : "text-[#8f6f68]"}`}>
                    {item.subtitle}
                  </p>
                </div>

                <div
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 ${item.cardClassName.includes("text-white") ? "ring-1 ring-white/20" : "bg-[#f8f0ee]"}`}
                >
                  <Icon className={`h-7 w-7 ${item.iconClassName}`} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
