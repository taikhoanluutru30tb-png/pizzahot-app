type OrderStatus = "Chốt thành công" | "Đã thanh toán" | "Hoàn tất";

type Order = {
  id: string;
  time: string;
  customerName: string;
  totalBill: string;
  status: OrderStatus;
  commission: string;
  commissionDetail: string;
};

const successfulOrders: Order[] = [
  {
    id: "#ORD-8812",
    time: "08:15 • Hôm nay",
    customerName: "Nguyễn Thị Hạnh",
    totalBill: "320.000đ",
    status: "Chốt thành công",
    commission: "+32.000đ",
    commissionDetail: "Hoa hồng 10% từ đơn hàng",
  },
  {
    id: "#ORD-8816",
    time: "10:40 • Hôm nay",
    customerName: "Trần Quốc Bảo",
    totalBill: "540.000đ",
    status: "Đã thanh toán",
    commission: "+54.000đ",
    commissionDetail: "Đã cộng vào ví hoa hồng",
  },
  {
    id: "#ORD-8821",
    time: "13:05 • Hôm nay",
    customerName: "Lê Thị Thu Trang",
    totalBill: "780.000đ",
    status: "Hoàn tất",
    commission: "+78.000đ",
    commissionDetail: "Đơn giao thành công và đã xác nhận",
  },
  {
    id: "#ORD-8830",
    time: "15:25 • Hôm nay",
    customerName: "Phạm Hoàng Long",
    totalBill: "615.000đ",
    status: "Chốt thành công",
    commission: "+61.500đ",
    commissionDetail: "Hoa hồng dự kiến nhận cuối ngày",
  },
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    "Chốt thành công": "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "Đã thanh toán": "bg-sky-50 text-sky-700 ring-sky-200",
    "Hoàn tất": "bg-violet-50 text-violet-700 ring-violet-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ring-1 ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function CtvOrdersPage() {
  const totalCommission = "225.500đ";

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-4 text-[#241615] sm:space-y-5 sm:px-5 lg:px-6">
      <section className="rounded-[28px] bg-gradient-to-br from-[#fff8f6] via-white to-[#fffdfc] p-5 shadow-[0_12px_32px_rgba(97,39,25,0.06)] ring-1 ring-[#f0dfda] sm:p-6">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#b18a83]">
            CTV / Đơn hàng đã chốt
          </p>
          <h1 className="text-[1.8rem] font-black tracking-tight text-[#241615] sm:text-[2.1rem]">
            Danh sách đơn hàng thành công
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[#987b75] sm:text-base">
            Theo dõi các đơn CTV đã chốt thành công, kèm tổng bill, trạng thái đơn và hoa hồng nhận được từ từng đơn.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[20px] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(97,39,25,0.04)] ring-1 ring-[#f0e3df]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a88d86]">Đơn thành công</p>
            <p className="mt-2 text-2xl font-black text-[#c62828]">{successfulOrders.length}</p>
          </div>
          <div className="rounded-[20px] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(97,39,25,0.04)] ring-1 ring-[#f0e3df]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a88d86]">Hoa hồng đã nhận</p>
            <p className="mt-2 text-2xl font-black text-emerald-600">{totalCommission}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {successfulOrders.map((order) => (
          <article
            key={order.id}
            className="rounded-[24px] border border-[#efe2df] bg-white p-4 shadow-[0_10px_28px_rgba(97,39,25,0.05)] transition active:scale-[0.99] sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a98b84]">
                  {order.id}
                </p>
                <h2 className="text-[1.08rem] font-extrabold tracking-tight text-[#251714] sm:text-[1.12rem]">
                  {order.customerName}
                </h2>
                <p className="text-sm font-medium text-[#9d7f79]">{order.time}</p>
              </div>

              <StatusBadge status={order.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-[#fbf7f6] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a78b85]">
                  Tổng bill
                </p>
                <p className="mt-1 text-[1.05rem] font-black text-[#c62828]">{order.totalBill}</p>
              </div>

              <div className="rounded-[18px] bg-[#f1fbf4] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Tiền hoa hồng
                </p>
                <p className="mt-1 text-[1.05rem] font-black text-emerald-600">{order.commission}</p>
              </div>
            </div>

            <div className="mt-3 rounded-[18px] bg-[#faf7f6] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#aa9089]">
                Ghi chú hoa hồng
              </p>
              <p className="mt-1 text-sm text-[#6b5751]">{order.commissionDetail}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
