"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  ArrowDownWideNarrow,
  ChefHat,
  Edit3,
  Filter,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { db } from "@/app/lib/firebase";
import { useMenuItems, type MenuItem } from "@/app/lib/use-menu-items";

type MenuFormState = {
  name: string;
  price: string;
  category: string;
  description: string;
  imageUrl: string;
};

const emptyForm: MenuFormState = {
  name: "",
  price: "",
  category: "Pizza",
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
  const { menuItems: items, error: menuError } = useMenuItems();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
    return ["Tất cả", ...unique];
  }, [items]);

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeCategory)) {
      setActiveCategory("Tất cả");
    }
  }, [categories]);

  const filteredItems = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = activeCategory === "Tất cả" || item.category === activeCategory;
      const matchesSearch =
        !queryText ||
        item.name.toLowerCase().includes(queryText) ||
        item.category.toLowerCase().includes(queryText) ||
        item.description.toLowerCase().includes(queryText);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, items, search]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.category.trim() || !form.imageUrl.trim()) {
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
        category: form.category.trim(),
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
      category: item.category,
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff0ef] text-[#c62828]">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#251714]">Danh sách thực đơn</h2>
              <p className="text-sm text-[#9d7f79]">{filteredItems.length} món được hiển thị</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 sm:min-w-[280px]">
              <span className="sr-only">Tìm kiếm món ăn</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#aa8c85]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên, loại, mô tả..."
                className="w-full rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] py-3 pl-11 pr-4 text-sm font-medium text-[#4d3b37] outline-none transition placeholder:text-[#b99c95] focus:border-[#c62828] focus:bg-white"
              />
            </label>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 font-semibold text-[#6f5752] transition hover:bg-white"
            >
              <Filter className="h-4 w-4" />
              Bộ lọc
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 font-semibold text-[#6f5752] transition hover:bg-white"
            >
              <ArrowDownWideNarrow className="h-4 w-4" />
              Sắp xếp
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-[#c62828] text-white shadow-[0_10px_20px_rgba(198,40,40,0.18)]"
                    : "bg-[#fff7f6] text-[#6f5752] hover:bg-[#f6ecea]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-[#f0e3df] md:block">
          <table className="min-w-full divide-y divide-[#f1e4e0]">
            <thead className="bg-[#fcf8f7]">
              <tr className="text-left text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#a78b85]">
                <th className="px-4 py-4">Món ăn</th>
                <th className="px-4 py-4">Phân loại</th>
                <th className="px-4 py-4">Giá</th>
                <th className="px-4 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f6eeeb] bg-white">
              {filteredItems.map((item) => (
                <tr key={item.id} className="align-middle transition hover:bg-[#fffdfc]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-2xl object-cover ring-1 ring-[#edded9]" />
                      <div>
                        <p className="font-extrabold text-[#261815]">{item.name}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-[#9d7f79]">{item.description || "Không có mô tả"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-[#f8f2f1] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#8a6f69]">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[1.05rem] font-black text-[#c62828]">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(item)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#eadad5] bg-white px-3 py-2 text-sm font-semibold text-[#6f5752] transition hover:bg-[#faf6f5]"
                      >
                        <Edit3 className="h-4 w-4" />
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#f2d1d1] bg-[#fff7f7] px-3 py-2 text-sm font-semibold text-[#c62828] transition hover:bg-[#ffecec]"
                      >
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

        <div className="mt-6 grid grid-cols-1 gap-3 md:hidden">
          {filteredItems.map((item) => (
            <article key={item.id} className="rounded-[24px] border border-[#f0e3df] bg-[#fffdfc] p-4 shadow-[0_8px_24px_rgba(97,39,25,0.04)]">
              <div className="flex gap-4">
                <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-2xl object-cover ring-1 ring-[#edded9]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-extrabold text-[#261815]">{item.name}</h3>
                      <p className="mt-1 text-sm text-[#9d7f79]">{item.description || "Không có mô tả"}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f8f2f1] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#8a6f69]">
                      {item.category}
                    </span>
                    <span className="text-lg font-black text-[#c62828]">{formatCurrency(item.price)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#f3e8e5] pt-4">
                <ActionButton icon={Edit3} label={`Sửa ${item.name}`} onClick={() => openEditForm(item)} />
                <ActionButton icon={Trash2} label={`Xóa ${item.name}`} tone="danger" onClick={() => handleDelete(item.id)} />
              </div>
            </article>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-[#e8d8d3] bg-[#fcfaf9] p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff0ef] text-[#c62828]">
              <ChefHat className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-[#251714]">Không tìm thấy món ăn phù hợp</h3>
            <p className="mt-2 text-sm text-[#9d7f79]">Thử thay đổi từ khóa tìm kiếm hoặc thêm món mới.</p>
          </div>
        ) : null}
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
                  <input
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 outline-none transition focus:border-[#c62828]"
                    placeholder="Pizza / Burger / Drinks..."
                  />
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
