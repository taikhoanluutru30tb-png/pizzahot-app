import { ArrowUpRight, BriefcaseBusiness, Clock3, Filter, Plus, Search, ShieldCheck, Truck, UserCog, Users } from "lucide-react";

type EmployeeRole = "Staff" | "CTV" | "Shipper";
type EmploymentStatus = "Đang hoạt động" | "Ngoại tuyến" | "Tạm nghỉ";

type Employee = {
  id: string;
  name: string;
  phone: string;
  role: EmployeeRole;
  status: EmploymentStatus;
  avatar: string;
  historySummary: string;
};

type RoleMeta = {
  label: string;
  className: string;
  icon: typeof BriefcaseBusiness;
};

type StatusMeta = {
  label: string;
  className: string;
  dotClassName: string;
  icon: typeof ShieldCheck;
};

const employees: Employee[] = [
  {
    id: "ST-1001",
    name: "Nguyễn Văn An",
    phone: "090 123 4567",
    role: "Staff",
    status: "Đang hoạt động",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    historySummary: "24 ca làm, 8 ngày gần nhất",
  },
  {
    id: "CTV-2048",
    name: "Lê Thu Bình",
    phone: "091 888 9900",
    role: "CTV",
    status: "Ngoại tuyến",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
    historySummary: "12 phiên hỗ trợ, 2 báo cáo gần đây",
  },
  {
    id: "SP-3302",
    name: "Trần Quốc Huy",
    phone: "098 555 2233",
    role: "Shipper",
    status: "Đang hoạt động",
    avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=160&q=80",
    historySummary: "36 chuyến giao, 98% đúng giờ",
  },
  {
    id: "ST-1007",
    name: "Phạm Minh Châu",
    phone: "093 222 7788",
    role: "Staff",
    status: "Tạm nghỉ",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=80",
    historySummary: "18 ca làm, đang xin nghỉ phép",
  },
  {
    id: "CTV-2211",
    name: "Đặng Gia Hân",
    phone: "097 404 2024",
    role: "CTV",
    status: "Đang hoạt động",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80",
    historySummary: "15 phiên hỗ trợ, 1 cảnh báo trễ ca",
  },
  {
    id: "SP-3408",
    name: "Vũ Minh Khoa",
    phone: "096 770 9090",
    role: "Shipper",
    status: "Ngoại tuyến",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
    historySummary: "28 chuyến giao, 4 ngày offline",
  },
];

const roleMeta: Record<EmployeeRole, RoleMeta> = {
  Staff: {
    label: "Staff",
    className: "bg-[#fff1f0] text-[#c62828] ring-1 ring-[#f4c6c0]",
    icon: UserCog,
  },
  CTV: {
    label: "CTV",
    className: "bg-[#fff6ea] text-[#b86b00] ring-1 ring-[#f3d9a7]",
    icon: Users,
  },
  Shipper: {
    label: "Shipper",
    className: "bg-[#edf7ff] text-[#1565c0] ring-1 ring-[#b8dcff]",
    icon: Truck,
  },
};

const statusMeta: Record<EmploymentStatus, StatusMeta> = {
  "Đang hoạt động": {
    label: "Đang hoạt động",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dotClassName: "bg-emerald-500",
    icon: ShieldCheck,
  },
  "Ngoại tuyến": {
    label: "Ngoại tuyến",
    className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    dotClassName: "bg-slate-400",
    icon: Clock3,
  },
  "Tạm nghỉ": {
    label: "Tạm nghỉ",
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dotClassName: "bg-amber-500",
    icon: Clock3,
  },
};

const stats = [
  { label: "Tổng nhân sự", value: "124", helper: "Nhân viên hiện tại", icon: Users, accent: "text-[#c62828]" },
  { label: "Staff", value: "72", helper: "Nhân sự nội bộ", icon: UserCog, accent: "text-[#8b5e34]" },
  { label: "CTV", value: "28", helper: "Cộng tác viên", icon: BriefcaseBusiness, accent: "text-[#b86b00]" },
  { label: "Shipper", value: "24", helper: "Đội giao hàng", icon: Truck, accent: "text-[#1565c0]" },
];

export default function AdminHrPage() {
  return (
    <div className="space-y-6 pb-6 text-[#241615] lg:space-y-8">
      <section className="rounded-[30px] bg-gradient-to-br from-[#fff9f7] via-white to-[#fff3f0] p-4 shadow-[0_12px_40px_rgba(97,39,25,0.05)] ring-1 ring-[#f0dfda] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b08d85]">Human Resources Management</p>
              <h1 className="mt-2 text-[1.9rem] font-black tracking-tight text-[#231714] lg:text-[2.5rem]">Quản lý nhân sự</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9f827c] lg:text-base">
                Theo dõi danh sách nhân viên thuộc nhóm Staff, CTV và Shipper, kèm trạng thái làm việc và lịch sử hoạt động.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#eadbd7] bg-white px-4 py-3 text-sm font-bold text-[#4d3a35] transition hover:bg-[#fff7f5]">
                <Filter className="h-4 w-4 text-[#c62828]" />
                Bộ lọc nhân sự
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c62828] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(198,40,40,0.22)] transition hover:bg-[#a91f1f]">
                <Plus className="h-4 w-4" />
                Thêm nhân viên
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.label} className="rounded-[22px] border border-[#f0e3df] bg-white p-4 shadow-[0_8px_22px_rgba(97,39,25,0.04)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a78c86]">{item.label}</p>
                      <div className={`mt-2 text-[2rem] font-black tracking-tight ${item.accent}`}>{item.value}</div>
                      <p className="mt-1 text-sm text-[#9f827c]">{item.helper}</p>
                    </div>
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#faf4f2] text-[#c62828]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[1.05rem] font-extrabold text-[#2f1f1b] lg:text-[1.15rem]">Danh sách nhân viên</h2>
            <p className="mt-1 text-sm text-[#9a7d77]">Hiển thị avatar, tên, số điện thoại, vai trò và trạng thái làm việc.</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#eadbd7] bg-[#fffafa] px-4 py-3 sm:w-[320px] lg:w-[340px]">
              <Search className="h-4 w-4 shrink-0 text-[#c2a8a2]" />
              <input
                type="text"
                placeholder="Tìm kiếm nhân sự..."
                className="w-full bg-transparent text-sm text-[#4d3a35] outline-none placeholder:text-[#b79d98]"
              />
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#eadbd7] bg-white px-4 py-3 text-sm font-bold text-[#4d3a35] transition hover:bg-[#fff7f5]">
              <ArrowUpRight className="h-4 w-4 text-[#c62828]" />
              Xem lịch sử làm việc
            </button>
          </div>
        </div>

        <div className="mt-5 hidden overflow-hidden rounded-[22px] border border-[#f2e6e2] lg:block">
          <table className="min-w-full divide-y divide-[#f2e6e2]">
            <thead className="bg-[#fff8f6]">
              <tr className="text-left text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#a78c86]">
                <th className="px-5 py-4">Nhân viên</th>
                <th className="px-5 py-4">Số điện thoại</th>
                <th className="px-5 py-4">Vai trò</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2e6e2] bg-white">
              {employees.map((employee) => {
                const role = roleMeta[employee.role];
                const status = statusMeta[employee.status];
                const RoleIcon = role.icon;
                const StatusIcon = status.icon;

                return (
                  <tr key={employee.id} className="transition hover:bg-[#fffdfa]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#f4ece8] shadow-[0_8px_18px_rgba(97,39,25,0.08)]">
                          <img src={employee.avatar} alt={employee.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-extrabold text-[#2f1f1b]">{employee.name}</p>
                          <p className="mt-1 text-sm text-[#a78c86]">Mã NV: {employee.id}</p>
                          <p className="mt-1 text-xs text-[#b79d98]">{employee.historySummary}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-[#5c4843]">{employee.phone}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${role.className}`}>
                        <RoleIcon className="h-3.5 w-3.5" />
                        {role.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}>
                        <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="inline-flex items-center gap-2 rounded-xl border border-[#eadbd7] bg-white px-3 py-2 text-sm font-bold text-[#4d3a35] transition hover:bg-[#fff7f5]">
                          <Clock3 className="h-4 w-4 text-[#c62828]" />
                          Lịch sử làm việc
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-xl bg-[#fff1f0] px-3 py-2 text-sm font-bold text-[#c62828] transition hover:bg-[#ffe5e2]">
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 space-y-3 lg:hidden">
          {employees.map((employee) => {
            const role = roleMeta[employee.role];
            const status = statusMeta[employee.status];
            const RoleIcon = role.icon;
            const StatusIcon = status.icon;

            return (
              <article key={employee.id} className="rounded-[24px] border border-[#f1e5e1] bg-[#fffdfc] p-4 shadow-[0_10px_24px_rgba(97,39,25,0.04)]">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f4ece8] shadow-[0_8px_18px_rgba(97,39,25,0.08)]">
                    <img src={employee.avatar} alt={employee.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-[1.05rem] font-extrabold text-[#2f1f1b]">{employee.name}</h3>
                        <p className="mt-1 text-sm text-[#9f827c]">{employee.phone}</p>
                      </div>
                      <span className="rounded-full bg-[#fff1f0] px-2.5 py-1 text-[11px] font-bold text-[#c62828]">{employee.id}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${role.className}`}>
                        <RoleIcon className="h-3.5 w-3.5" />
                        {role.label}
                      </span>
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}>
                        <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-[#8f736d]">{employee.historySummary}</p>

                    <div className="mt-4 flex gap-2">
                      <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#eadbd7] bg-white px-3 py-2.5 text-sm font-bold text-[#4d3a35]">
                        <Clock3 className="h-4 w-4 text-[#c62828]" />
                        Lịch sử làm việc
                      </button>
                      <button className="inline-flex items-center justify-center rounded-xl bg-[#fff1f0] px-4 py-2.5 text-sm font-bold text-[#c62828]">
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
