"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { Edit3, Plus, Trash2, UtensilsCrossed, X } from "lucide-react";

import { db } from "@/app/lib/firebase";
import { MenuListSection } from "@/app/components/menu-list-section";
import { useMenuItems, type MenuItem } from "@/app/lib/use-menu-items";

type MenuFormState = {
  name: string;
  price: string;
  phan_loai: string;
  description: string;
  imageUrl: string;
};

const categoryOptions = ["Pizza", "Đồ uống", "Khai vị", "Món chính"] as const;

const emptyForm: MenuFormState = {
  name: "",
  price: "",
  phan_loai: "Pizza",
  description: "",
  imageUrl: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function ActionButton({ icon: Icon, label, tone = "neutral", onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; tone?: "neutral" | "danger"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${
        tone === "danger"
          ? "border-[#f2d1d1] bg-[#fff7f7] text-[#c62828] hover:bg-[#ffecec]"
          : "border-[#e8d8d3] bg-white text-[#7d645f] hover:bg-[#faf6f5]"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export default function AdminMenuPage() {
  const { menuItems: items, categories, loading, error: menuError } = useMenuItems();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [sort, setSort] = useState("recommended");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.phan_loai.trim() || !form.imageUrl.trim()) {
      setError("Vui lòng nhập Tên món, Phân loại và Link ảnh.");
      return;
    }

    const priceNumber = Number(form.price);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      setError("Giá phải là một số hợp lệ và lớn hơn hoặc bằng 0.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name: form.name.trim(),
        price: priceNumber,
        phan_loai: form.phan_loai.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
      };

      if (editingItem) {
        await updateDoc(doc(db, "menu", editingItem.id), payload);
        setSuccess("Đã cập nhật món ăn.");
      } else {
        await addDoc(collection(db, "menu"), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setSuccess("Đã thêm món ăn mới.");
      }

      setForm(emptyForm);
      setEditingItem(null);
      setIsFormOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Đã xảy ra lỗi khi lưu dữ liệu.");
    } finally {
      setIsSaving(false);
    }
  }

  function openCreateForm() {
    setEditingItem(null);
    setForm(emptyForm);
    setError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  function openEditForm(item: MenuItem) {
    setEditingItem(item);
    setForm({
      name: item.name,
      price: String(item.price),
      phan_loai: item.category,
      description: item.description,
      imageUrl: item.imageUrl,
    });
    setError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa món ăn này không?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "menu", id));
      setSuccess("Đã xóa món ăn.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa món ăn.");
    }
  }

  function closeForm() {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  return (
    <main className="space-y-5 pb-4 text-[#4b342f] sm:space-y-6 lg:space-y-8">
      <section className="rounded-[28px] border border-[#efdfdc] bg-white p-4 shadow-[0_12px_40px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#b28b84]">Quản lý thực đơn</p>
            <h1 className="mt-2 text-[clamp(1.7rem,4vw,2.6rem)] font-black tracking-tight text-[#241614]">Quản lý menu</h1>
            <p className="mt-2 text-sm text-[#9b7d78] lg:text-base">
              Danh sách tự động cập nhật
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c62828] px-5 py-3.5 font-bold text-white shadow-[0_12px_24px_rgba(198,40,40,0.22)] transition hover:bg-[#a91f1f]"
            >
              <Plus className="h-4 w-4" />
              Thêm món mới
            </button>
          </div>
        </div>
      </section>

      {menuError || error ? (
        <div className="rounded-2xl border border-[#f2d1d1] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#b42318]">{menuError ?? error}</div>
      ) : null}
      {success ? (
        <div className="rounded-2xl border border-[#d9f0df] bg-[#f3fbf5] px-4 py-3 text-sm font-medium text-[#1f7a39]">{success}</div>
      ) : null}

      <section className="rounded-[28px] border border-[#efdfdc] bg-white p-4 shadow-[0_12px_40px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
        <div className="overflow-hidden rounded-[24px] border border-[#f1e5e1] bg-white shadow-[0_10px_24px_rgba(97,39,25,0.04)]">
          <table className="min-w-full divide-y divide-[#f3e8e5]">
            <thead className="bg-[#fcf8f7] text-left text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#a78b85]">
              <tr>
                <th className="px-4 py-4">Món ăn</th>
                <th className="px-4 py-4">Phân loại</th>
                <th className="px-4 py-4">Giá</th>
                <th className="px-4 py-4">Mô tả</th>
                <th className="px-4 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f6eeeb] bg-white">
              {items.map((item) => (
                <tr key={item.id} className="align-top transition hover:bg-[#fffdfc]">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-[#2a1d1a]">{item.name}</div>
                    <div className="mt-1 text-xs text-[#9a7d77]">ID: {item.id}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-[#fff7f5] px-3 py-1.5 text-xs font-bold text-[#c62828] ring-1 ring-[#f4c8c4]">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-black text-[#2a1d1a]">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-4 text-sm text-[#6f5a55]">{item.description || "Không có mô tả"}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button type="button" onClick={() => openEditForm(item)} className="inline-flex items-center gap-2 rounded-2xl border border-[#eadad5] bg-white px-3 py-2 text-sm font-semibold text-[#6f5752] transition hover:bg-[#faf6f5]">
                        <Edit3 className="h-4 w-4" />
                        Sửa
                      </button>
                      <button type="button" onClick={() => handleDelete(item.id)} className="inline-flex items-center gap-2 rounded-2xl border border-[#f2d1d1] bg-[#fff7f7] px-3 py-2 text-sm font-semibold text-[#c62828] transition hover:bg-[#ffecec]">
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <div className="flex items-start justify-between border-b border-[#f2e7e4] px-5 py-4 sm:px-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b28b84]">{editingItem ? "Cập nhật món ăn" : "Thêm món ăn"}</p>
                <h2 className="mt-1 text-xl font-black text-[#241614]">{editingItem ? "Chỉnh sửa menu" : "Tạo món mới"}</h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eadad5] text-[#6f5752] transition hover:bg-[#faf6f5]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 px-5 py-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#5b4742]">Tên món</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 outline-none transition focus:border-[#c62828]"
                    placeholder="Ví dụ: Pizza Hải Sản"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#5b4742]">Giá</span>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    className="rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 outline-none transition focus:border-[#c62828]"
                    placeholder="120000"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#5b4742]">Phân loại</span>
                  <select
                    value={form.phan_loai}
                    onChange={(e) => setForm((prev) => ({ ...prev, phan_loai: e.target.value }))}
                    className="rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 outline-none transition focus:border-[#c62828]"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#5b4742]">Link ảnh</span>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    className="rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 outline-none transition focus:border-[#c62828]"
                    placeholder="https://..."
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#5b4742]">Mô tả</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="min-h-[120px] rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 outline-none transition focus:border-[#c62828]"
                  placeholder="Mô tả ngắn về món ăn"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-2xl border border-[#e7dbd8] bg-white px-5 py-3 font-semibold text-[#6f5752] transition hover:bg-[#faf6f5]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-[#c62828] px-5 py-3 font-bold text-white transition hover:bg-[#a91f1f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? "Đang lưu..." : editingItem ? "Cập nhật món ăn" : "Thêm món ăn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
