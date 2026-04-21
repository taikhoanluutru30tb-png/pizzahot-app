import type { ReactNode } from "react";
import { BellRing, BriefcaseBusiness, CalendarClock, Clock3, DollarSign, Gauge, Save, ShieldAlert, Smartphone } from "lucide-react";

type SettingCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function SettingCard({ icon, title, description, children }: SettingCardProps) {
  return (
    <section className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_10px_30px_rgba(97,39,25,0.06)] sm:p-6 lg:p-7">
      <div className="mb-5 flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff2f0] text-[#c62828] shadow-sm ring-1 ring-[#f1dad6]">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-[#2f1f1b] sm:text-xl">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#9a7d77]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-sm font-bold text-[#4a332f]">{children}</label>;
}

export default function TimekeepingPage() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="rounded-[30px] bg-[#fff9f7] p-4 shadow-[0_12px_40px_rgba(97,39,25,0.05)] ring-1 ring-[#f0dfda] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b08d85]">Thiết lập chấm công</p>
            <h1 className="mt-2 text-[1.9rem] font-black tracking-tight text-[#231714] lg:text-[2.5rem]">Cài đặt timekeeping cho nhân viên</h1>
            <p className="mt-2 max-w-3xl text-sm text-[#9f827c] lg:text-base">
              Thiết lập giờ vào ca, giờ tan ca, mức lương theo giờ và quy định đi muộn để hệ thống chấm công hoạt động chính xác.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#f0d3cf] bg-white px-4 py-3 text-sm font-bold text-[#7d4a45] transition hover:bg-[#fff4f2]">
              <ShieldAlert className="h-4 w-4" />
              Khôi phục mặc định
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c62828] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(198,40,40,0.25)] transition hover:bg-[#a91f1f]">
              <Save className="h-4 w-4" />
              Lưu cấu hình
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="space-y-4 sm:space-y-5">
            <SettingCard
              icon={<Clock3 className="h-5 w-5" />}
              title="Giờ làm việc"
              description="Thiết lập khung giờ chuẩn mà nhân viên phải có mặt để tính công trong ngày."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Giờ vào ca</FieldLabel>
                  <div className="relative">
                    <CalendarClock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c46d5f]" />
                    <input
                      type="time"
                      defaultValue="08:00"
                      className="h-14 w-full rounded-2xl border border-[#e9dedb] bg-[#fffdfc] pl-12 pr-4 text-[1rem] font-semibold text-[#2f1f1b] outline-none transition placeholder:text-[#b79d96] focus:border-[#c62828] focus:bg-white focus:ring-4 focus:ring-[#f7d8d4]"
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#a88c86]">Ví dụ: 08:00, 09:00 hoặc 10:00 tùy ca làm.</p>
                </div>

                <div>
                  <FieldLabel>Giờ tan ca</FieldLabel>
                  <div className="relative">
                    <CalendarClock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c46d5f]" />
                    <input
                      type="time"
                      defaultValue="17:30"
                      className="h-14 w-full rounded-2xl border border-[#e9dedb] bg-[#fffdfc] pl-12 pr-4 text-[1rem] font-semibold text-[#2f1f1b] outline-none transition placeholder:text-[#b79d96] focus:border-[#c62828] focus:bg-white focus:ring-4 focus:ring-[#f7d8d4]"
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#a88c86]">Hệ thống dùng mốc này để ghi nhận thời gian kết ca.</p>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] bg-[#fcf9f8] p-4 ring-1 ring-[#f2e6e3]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#fff2f0] text-[#c62828]">
                    <Gauge className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2f1f1b]">Gợi ý cấu hình</p>
                    <p className="mt-1 text-sm leading-6 text-[#9a7d77]">
                      Nên đặt cùng mốc giờ cho các chi nhánh nếu muốn báo cáo chấm công đồng bộ và dễ đối soát.
                    </p>
                  </div>
                </div>
              </div>
            </SettingCard>

            <SettingCard
              icon={<DollarSign className="h-5 w-5" />}
              title="Mức lương theo giờ"
              description="Nhập đơn giá lương cơ bản để tính công và hỗ trợ xuất báo cáo lương tự động."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Mức lương / giờ</FieldLabel>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-[#c46d5f]">₫</span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      defaultValue={25000}
                      className="h-14 w-full rounded-2xl border border-[#e9dedb] bg-[#fffdfc] pl-9 pr-4 text-[1rem] font-semibold text-[#2f1f1b] outline-none transition placeholder:text-[#b79d96] focus:border-[#c62828] focus:bg-white focus:ring-4 focus:ring-[#f7d8d4]"
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#a88c86]">Bạn có thể nhập theo VND hoặc định dạng số nguyên.</p>
                </div>

                <div>
                  <FieldLabel>Áp dụng cho</FieldLabel>
                  <select className="h-14 w-full rounded-2xl border border-[#e9dedb] bg-[#fffdfc] px-4 text-[1rem] font-semibold text-[#2f1f1b] outline-none transition focus:border-[#c62828] focus:bg-white focus:ring-4 focus:ring-[#f7d8d4]">
                    <option>Toàn bộ chi nhánh</option>
                    <option>Chi nhánh trung tâm</option>
                    <option>Chi nhánh giao hàng</option>
                    <option>Theo từng vị trí</option>
                  </select>
                  <p className="mt-2 text-xs text-[#a88c86]">Có thể tách mức lương theo vai trò nhân sự nếu cần.</p>
                </div>
              </div>
            </SettingCard>

            <SettingCard
              icon={<BellRing className="h-5 w-5" />}
              title="Quy định đi muộn"
              description="Thiết lập giới hạn thời gian trễ và cách xử lý khi nhân viên đến muộn."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Cho phép trễ tối đa (phút)</FieldLabel>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={15}
                      className="h-14 w-full rounded-2xl border border-[#e9dedb] bg-[#fffdfc] px-4 pr-20 text-[1rem] font-semibold text-[#2f1f1b] outline-none transition placeholder:text-[#b79d96] focus:border-[#c62828] focus:bg-white focus:ring-4 focus:ring-[#f7d8d4]"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#a88c86]">phút</span>
                  </div>
                  <p className="mt-2 text-xs text-[#a88c86]">Sau thời gian này hệ thống sẽ đánh dấu đi muộn.</p>
                </div>

                <div>
                  <FieldLabel>Hình thức xử lý</FieldLabel>
                  <select className="h-14 w-full rounded-2xl border border-[#e9dedb] bg-[#fffdfc] px-4 text-[1rem] font-semibold text-[#2f1f1b] outline-none transition focus:border-[#c62828] focus:bg-white focus:ring-4 focus:ring-[#f7d8d4]">
                    <option>Nhắc nhở nhẹ</option>
                    <option>Ghi nhận trừ công</option>
                    <option>Báo cáo quản lý</option>
                    <option>Gửi thông báo tự động</option>
                  </select>
                  <p className="mt-2 text-xs text-[#a88c86]">Chọn cách xử lý để đồng bộ với quy trình nội bộ.</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Mức phạt khi đi muộn</FieldLabel>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-[#c46d5f]">₫</span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      defaultValue={0}
                      className="h-14 w-full rounded-2xl border border-[#e9dedb] bg-[#fffdfc] pl-9 pr-4 text-[1rem] font-semibold text-[#2f1f1b] outline-none transition placeholder:text-[#b79d96] focus:border-[#c62828] focus:bg-white focus:ring-4 focus:ring-[#f7d8d4]"
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#a88c86]">Nếu không áp dụng phạt tiền, có thể để giá trị bằng 0.</p>
                </div>

                <div>
                  <FieldLabel>Thiết bị chấm công</FieldLabel>
                  <select className="h-14 w-full rounded-2xl border border-[#e9dedb] bg-[#fffdfc] px-4 text-[1rem] font-semibold text-[#2f1f1b] outline-none transition focus:border-[#c62828] focus:bg-white focus:ring-4 focus:ring-[#f7d8d4]">
                    <option>Điện thoại / QR</option>
                    <option>WiFi nội bộ</option>
                    <option>Máy chấm công</option>
                    <option>Kết hợp nhiều nguồn</option>
                  </select>
                  <p className="mt-2 text-xs text-[#a88c86]">Sử dụng để xác thực thời gian vào ca chính xác hơn.</p>
                </div>
              </div>
            </SettingCard>
          </div>
        </div>

        <aside className="space-y-4 sm:space-y-5 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_10px_30px_rgba(97,39,25,0.06)] sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff2f0] text-[#c62828] shadow-sm ring-1 ring-[#f1dad6]">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#2f1f1b]">Tóm tắt cấu hình</h2>
                <p className="mt-1 text-sm leading-6 text-[#9a7d77]">Xem nhanh các thông số đang được áp dụng cho hệ thống chấm công.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                ["Ca làm mặc định", "08:00 - 17:30"],
                ["Lương theo giờ", "25.000đ / giờ"],
                ["Đi muộn tối đa", "15 phút"],
                ["Cách xử lý", "Nhắc nhở nhẹ"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-[#fcf9f8] px-4 py-3 ring-1 ring-[#f2e6e3]">
                  <span className="text-sm font-medium text-[#8f726d]">{label}</span>
                  <span className="text-sm font-extrabold text-[#2f1f1b]">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_10px_30px_rgba(97,39,25,0.06)] sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff2f0] text-[#c62828] shadow-sm ring-1 ring-[#f1dad6]">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#2f1f1b]">Lưu ý vận hành</h2>
                <p className="mt-1 text-sm leading-6 text-[#9a7d77]">Các thiết lập này sẽ ảnh hưởng trực tiếp đến dữ liệu chấm công và báo cáo lương.</p>
              </div>
            </div>

            <ul className="mt-5 space-y-3 text-sm leading-6 text-[#7d645e]">
              <li className="rounded-2xl bg-[#fcf9f8] p-4 ring-1 ring-[#f2e6e3]">• Nên đồng bộ giờ làm việc giữa các chi nhánh để tránh lệch dữ liệu.</li>
              <li className="rounded-2xl bg-[#fcf9f8] p-4 ring-1 ring-[#f2e6e3]">• Đặt ngưỡng đi muộn vừa phải để giảm sai lệch khi nhân viên check-in.</li>
              <li className="rounded-2xl bg-[#fcf9f8] p-4 ring-1 ring-[#f2e6e3]">• Lưu cấu hình sau khi thay đổi để áp dụng cho ca tiếp theo.</li>
            </ul>
          </section>
        </aside>
      </section>
    </div>
  );
}
