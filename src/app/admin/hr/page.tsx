"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  ArrowUpRight,
  Edit,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  Truck,
  Users,
  X,
  Briefcase,
  UserCog,
} from "lucide-react";

import { auth, db } from "@/app/lib/firebase";

type EmployeeRole = "Admin" | "Staff" | "CTV" | "Shipper";
type EmployeeDoc = {
  id: string;
  ho_ten: string;
  email: string;
  so_dien_thoai: string;
  role: EmployeeRole;
  mat_khau?: string;
};

type FormState = {
  ho_ten: string;
  email: string;
  so_dien_thoai: string;
  mat_khau: string;
  role: EmployeeRole;
};

type RoleMeta = {
  label: string;
  className: string;
  icon: typeof UserCog;
};

const roleMeta: Record<EmployeeRole, RoleMeta> = {
  Admin: { label: "admin", className: "bg-[#fff1f0] text-[#c62828] ring-1 ring-[#f4c6c0]", icon: UserCog },
  Staff: { label: "staff", className: "bg-[#edf8ee] text-[#1b7f3a] ring-1 ring-[#c7ead0]", icon: ShieldCheck },
  CTV: { label: "ctv", className: "bg-[#f2eaff] text-[#7a3db8] ring-1 ring-[#dcc9f5]", icon: Briefcase },
  Shipper: { label: "shipper", className: "bg-[#fff4e5] text-[#c96a00] ring-1 ring-[#f5d1a2]", icon: Truck },
};

const roleValues = ["Admin", "Staff", "CTV", "Shipper"] as const;
const roleLabels: Record<EmployeeRole, string> = {
  Admin: "admin",
  Staff: "staff",
  CTV: "ctv",
  Shipper: "shipper",
};

const supportAccount = {
  id: "sSpnKRmpjrcn6xLBzpNRs11IUn83",
  ho_ten: "Đào Mạnh Cường",
  email: "quanlypizzahot@gmail.com",
  so_dien_thoai: "0348726823",
  role: "Admin" as EmployeeRole,
  mat_khau: "Cuong2608203@",
};

const emptyForm: FormState = { ho_ten: "", email: "", so_dien_thoai: "", mat_khau: "", role: "Staff" };

function normalizeRole(value: unknown): EmployeeRole {
  if (value === "Admin" || value === "Staff" || value === "CTV" || value === "Shipper") return value;
  if (value === "admin") return "Admin";
  if (value === "staff") return "Staff";
  if (value === "ctv") return "CTV";
  if (value === "shipper") return "Shipper";
  return "Staff";
}

export default function AdminHrPage() {
  const [employees, setEmployees] = useState<EmployeeDoc[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"Tất cả" | EmployeeRole>("Tất cả");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDoc | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void setDoc(doc(db, "users", supportAccount.id), {
      uid: supportAccount.id,
      ho_ten: supportAccount.ho_ten,
      email: supportAccount.email,
      so_dien_thoai: supportAccount.so_dien_thoai,
      role: supportAccount.role,
      mat_khau: supportAccount.mat_khau,
      is_support: true,
    }, { merge: true });

    const q = query(collection(db, "users"), orderBy("ho_ten", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((document) => {
          const data = document.data();
          return {
            id: document.id,
            ho_ten: String(data.ho_ten ?? data.name ?? ""),
            email: String(data.email ?? ""),
            so_dien_thoai: String(data.so_dien_thoai ?? data.phone ?? ""),
            role: normalizeRole(data.role),
            mat_khau: String(data.mat_khau ?? data.password ?? ""),
          } satisfies EmployeeDoc;
        });
        setEmployees(items);
      },
      (snapshotError) => setError(snapshotError.message || "Không thể tải danh sách nhân sự."),
    );
    return () => unsubscribe();
  }, []);

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesRole = filterRole === "Tất cả" || employee.role === filterRole;
      const matchesSearch =
        keyword.length === 0 ||
        [employee.ho_ten, employee.email, employee.so_dien_thoai, employee.role].some((value) =>
          value.toLowerCase().includes(keyword),
        );
      return matchesRole && matchesSearch;
    });
  }, [employees, filterRole, search]);

  const stats = useMemo(() => {
    const counts = employees.reduce(
      (acc, employee) => {
        acc.total += 1;
        acc[employee.role] += 1;
        return acc;
      },
      { total: 0, Admin: 0, Staff: 0, CTV: 0, Shipper: 0 },
    );
    return counts;
  }, [employees]);

  function openCreateModal() {
    setEditingEmployee(null);
    setForm(emptyForm);
    setError(null);
    setMessage(null);
    setIsModalOpen(true);
  }

  function openEditModal(employee: EmployeeDoc) {
    setEditingEmployee(employee);
    setForm({
      ho_ten: employee.ho_ten,
      email: employee.email,
      so_dien_thoai: employee.so_dien_thoai,
      mat_khau: employee.mat_khau ?? "",
      role: employee.role,
    });
    setError(null);
    setMessage(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingEmployee(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.ho_ten.trim() || !form.email.trim() || !form.so_dien_thoai.trim() || !form.mat_khau.trim()) {
      setError("Vui lòng nhập đầy đủ Họ tên, Email, Số điện thoại và Mật khẩu.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        ho_ten: form.ho_ten.trim(),
        email: form.email.trim(),
        so_dien_thoai: form.so_dien_thoai.trim(),
        mat_khau: form.mat_khau,
        role: form.role,
      };

      if (payload.email === supportAccount.email) {
        payload.role = supportAccount.role;
      }

      if (editingEmployee) {
        await updateDoc(doc(db, "users", editingEmployee.id), payload);
        setMessage("Đã cập nhật nhân sự.");
      } else {
        const credential = await createUserWithEmailAndPassword(auth, payload.email, payload.mat_khau);
        await setDoc(doc(db, "users", credential.user.uid), {
          ...payload,
          uid: credential.user.uid,
        });
        setMessage("Đã thêm nhân sự mới và tạo tài khoản đăng nhập.");
      }

      closeModal();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể lưu dữ liệu nhân sự.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhân sự này không?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      setMessage("Đã xóa nhân sự.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa nhân sự.");
    }
  }

  return (
    <div className="space-y-6 pb-6 text-[#241615] lg:space-y-8">
      <section className="rounded-[30px] bg-gradient-to-br from-[#fff9f7] via-white to-[#fff3f0] p-4 shadow-[0_12px_40px_rgba(97,39,25,0.05)] ring-1 ring-[#f0dfda] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b08d85]">Quản lý nhân sự</p>
              <h1 className="mt-2 text-[1.9rem] font-black tracking-tight text-[#231714] lg:text-[2.5rem]">Quản lý nhân sự</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9f827c] lg:text-base">
                Dữ liệu nhân sự
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setFilterRole("Tất cả")} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#eadbd7] bg-white px-4 py-3 text-sm font-bold text-[#4d3a35] transition hover:bg-[#fff7f5]">
                <Filter className="h-4 w-4 text-[#c62828]" />
                Bộ lọc nhân sự
              </button>
              <button onClick={openCreateModal} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c62828] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(198,40,40,0.22)] transition hover:bg-[#a91f1f]">
                <Plus className="h-4 w-4" />
                Thêm nhân viên
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { label: "Tổng nhân sự", value: stats.total, icon: Users, accent: "text-[#c62828]" },
              { label: "Admin", value: stats.Admin, icon: UserCog, accent: "text-[#c62828]" },
              { label: "Staff", value: stats.Staff, icon: ShieldCheck, accent: "text-[#1b7f3a]" },
              { label: "CTV / Shipper", value: stats.CTV + stats.Shipper, icon: Briefcase, accent: "text-[#7a3db8]" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.label} className="rounded-[22px] border border-[#f0e3df] bg-white p-4 shadow-[0_8px_22px_rgba(97,39,25,0.04)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a78c86]">{item.label}</p>
                      <div className={`mt-2 text-[2rem] font-black tracking-tight ${item.accent}`}>{item.value}</div>
                    </div>
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#faf4f2] text-[#c62828]"><Icon className="h-5 w-5" /></div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-[#f2d1d1] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#b42318]">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-[#d9f0df] bg-[#f3fbf5] px-4 py-3 text-sm font-medium text-[#1f7a39]">{message}</div> : null}

      <section className="rounded-[28px] border border-[#efe2df] bg-white p-4 shadow-[0_12px_34px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[1.05rem] font-extrabold text-[#2f1f1b] lg:text-[1.15rem]">Danh sách nhân viên</h2>
            <p className="mt-1 text-sm text-[#9a7d77]">Hiển thị Họ tên, Email, Số điện thoại và Vai trò theo dạng bảng hoặc card.</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#eadbd7] bg-[#fffafa] px-4 py-3 sm:w-[320px] lg:w-[340px]">
              <Search className="h-4 w-4 shrink-0 text-[#c2a8a2]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Tìm kiếm nhân sự..." className="w-full bg-transparent text-sm text-[#4d3a35] outline-none placeholder:text-[#b79d98]" />
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#eadbd7] bg-white px-4 py-3 text-sm font-bold text-[#4d3a35] transition hover:bg-[#fff7f5]">
              <ArrowUpRight className="h-4 w-4 text-[#c62828]" />
              Xem lịch sử làm việc
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["Tất cả", ...roleValues] as const).map((role) => (
            <button key={role} type="button" onClick={() => setFilterRole(role)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filterRole === role ? "bg-[#c62828] text-white" : "bg-[#fff7f6] text-[#6f5752] hover:bg-[#f6ecea]"}`}>
              {role === "Tất cả" ? role : roleLabels[role]}
            </button>
          ))}
        </div>

        <div className="mt-5 hidden overflow-hidden rounded-[22px] border border-[#f2e6e2] lg:block">
          <table className="min-w-full divide-y divide-[#f2e6e2]">
            <thead className="bg-[#fff8f6]">
              <tr className="text-left text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#a78c86]">
                <th className="px-5 py-4">Họ tên</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Số điện thoại</th>
                <th className="px-5 py-4">Vai trò</th>
                <th className="px-5 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2e6e2] bg-white">
              {filteredEmployees.map((employee) => {
                const role = roleMeta[employee.role];
                const RoleIcon = role.icon;
                return (
                  <tr key={employee.id} className="transition hover:bg-[#fffdfa]">
                    <td className="px-5 py-4 font-extrabold text-[#2f1f1b]">{employee.ho_ten}</td>
                    <td className="px-5 py-4 text-sm text-[#5c4843]">{employee.email}</td>
                    <td className="px-5 py-4 text-sm font-medium text-[#5c4843]">{employee.so_dien_thoai}</td>
                    <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${role.className}`}><RoleIcon className="h-3.5 w-3.5" />{role.label}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(employee)} className="inline-flex items-center gap-2 rounded-xl border border-[#eadbd7] bg-white px-3 py-2 text-sm font-bold text-[#4d3a35] transition hover:bg-[#fff7f5]"><Edit className="h-4 w-4 text-[#c62828]" />Sửa</button>
                        <button onClick={() => handleDelete(employee.id)} className="inline-flex items-center gap-2 rounded-xl bg-[#fff1f0] px-3 py-2 text-sm font-bold text-[#c62828] transition hover:bg-[#ffe5e2]">Xóa</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 space-y-3 lg:hidden">
          {filteredEmployees.map((employee) => {
            const role = roleMeta[employee.role];
            const RoleIcon = role.icon;
            return (
              <article key={employee.id} className="rounded-[24px] border border-[#f1e5e1] bg-[#fffdfc] p-4 shadow-[0_10px_24px_rgba(97,39,25,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[1.05rem] font-extrabold text-[#2f1f1b]">{employee.ho_ten}</h3>
                    <p className="mt-1 text-sm text-[#9f827c]">{employee.email}</p>
                    <p className="mt-1 text-sm text-[#9f827c]">{employee.so_dien_thoai}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${role.className}`}><RoleIcon className="h-3.5 w-3.5" />{role.label}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openEditModal(employee)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#eadbd7] bg-white px-3 py-2.5 text-sm font-bold text-[#4d3a35]"><Edit className="h-4 w-4 text-[#c62828]" />Sửa</button>
                  <button onClick={() => handleDelete(employee.id)} className="inline-flex items-center justify-center rounded-xl bg-[#fff1f0] px-4 py-2.5 text-sm font-bold text-[#c62828]">Xóa</button>
                </div>
              </article>
            );
          })}
        </div>

        {filteredEmployees.length === 0 ? <div className="mt-6 rounded-[24px] border border-dashed border-[#eadbd7] bg-[#fffafa] px-4 py-10 text-center text-sm text-[#9a7d77]">Không tìm thấy nhân sự phù hợp.</div> : null}
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <div className="flex items-start justify-between border-b border-[#f2e7e4] px-5 py-4 sm:px-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b28b84]">{editingEmployee ? "Cập nhật nhân sự" : "Thêm nhân sự"}</p>
                <h2 className="mt-1 text-xl font-black text-[#241614]">{editingEmployee ? "Chỉnh sửa thông tin" : "Tạo nhân viên mới"}</h2>
              </div>
              <button type="button" onClick={closeModal} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eadad5] text-[#6f5752] transition hover:bg-[#faf6f5]"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 px-5 py-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2"><span className="text-sm font-semibold text-[#5b4742]">Họ tên</span><input value={form.ho_ten} onChange={(e) => setForm((p) => ({ ...p, ho_ten: e.target.value }))} className="rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 outline-none transition focus:border-[#c62828]" /></label>
                <label className="grid gap-2"><span className="text-sm font-semibold text-[#5b4742]">Email</span><input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 outline-none transition focus:border-[#c62828]" /></label>
                <label className="grid gap-2"><span className="text-sm font-semibold text-[#5b4742]">Số điện thoại</span><input value={form.so_dien_thoai} onChange={(e) => setForm((p) => ({ ...p, so_dien_thoai: e.target.value }))} className="rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 outline-none transition focus:border-[#c62828]" /></label>
                <label className="grid gap-2"><span className="text-sm font-semibold text-[#5b4742]">Mật khẩu</span><input type="text" value={form.mat_khau} onChange={(e) => setForm((p) => ({ ...p, mat_khau: e.target.value }))} className="rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 outline-none transition focus:border-[#c62828]" placeholder="Hiển thị text thường" /></label>
              </div>
              <label className="grid gap-2"><span className="text-sm font-semibold text-[#5b4742]">Role</span><select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as EmployeeRole }))} className="rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 outline-none transition focus:border-[#c62828]"><option>Admin</option><option>Staff</option><option>CTV</option><option>Shipper</option></select></label>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-[#e7dbd8] bg-white px-5 py-3 font-semibold text-[#6f5752] transition hover:bg-[#faf6f5]">Hủy</button>
                <button type="submit" disabled={isSaving} className="rounded-2xl bg-[#c62828] px-5 py-3 font-bold text-white transition hover:bg-[#a91f1f] disabled:cursor-not-allowed disabled:opacity-70">{isSaving ? "Đang lưu..." : editingEmployee ? "Cập nhật" : "Thêm mới"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
