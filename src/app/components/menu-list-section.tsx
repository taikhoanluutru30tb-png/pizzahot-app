"use client";

import Image from "next/image";
import { ArrowDownWideNarrow, Filter, Search, Plus } from "lucide-react";
import type { ReactNode } from "react";

import type { MenuItem, MenuSortKey } from "@/app/lib/use-menu-items";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export type MenuListSectionProps = {
  title: string;
  subtitle?: string;
  items: MenuItem[];
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sort: MenuSortKey;
  onSortChange: (value: MenuSortKey) => void;
  countLabel?: string;
  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  actionLabel?: string;
  onAction?: (item: MenuItem) => void;
  renderActions?: (item: MenuItem) => ReactNode;
};

export function MenuListSection({
  title,
  subtitle,
  items,
  categories,
  activeCategory,
  onCategoryChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  countLabel,
  loading,
  error,
  emptyTitle = "Không tìm thấy món ăn phù hợp",
  emptyDescription = "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.",
  actionLabel = "Thêm vào giỏ",
  onAction,
  renderActions,
}: MenuListSectionProps) {
  const sortOptions: { value: MenuSortKey; label: string }[] = [
    { value: "recommended", label: "Gợi ý" },
    { value: "price-asc", label: "Giá tăng dần" },
    { value: "price-desc", label: "Giá giảm dần" },
    { value: "name-asc", label: "Tên A-Z" },
  ];

  return (
    <section className="rounded-[28px] border border-[#efdfdc] bg-white p-4 shadow-[0_12px_40px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[#251714]">{title}</h2>
          {subtitle ? <p className="text-sm text-[#9d7f79]">{subtitle}</p> : null}
          {countLabel ? <p className="mt-1 text-sm font-medium text-[#b28b84]">{countLabel}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative block min-w-0 sm:min-w-[280px]">
            <span className="sr-only">Tìm kiếm món ăn</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#aa8c85]" />
            <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Tìm tên, loại, mô tả..." className="w-full rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] py-3 pl-11 pr-4 text-sm font-medium text-[#4d3b37] outline-none transition placeholder:text-[#b99c95] focus:border-[#c62828] focus:bg-white" />
          </label>

          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 font-semibold text-[#6f5752] transition hover:bg-white">
            <Filter className="h-4 w-4" />
            Bộ lọc
          </button>

          <label className="inline-flex items-center gap-2 rounded-2xl border border-[#e7dbd8] bg-[#fcfaf9] px-4 py-3 font-semibold text-[#6f5752] transition hover:bg-white">
            <ArrowDownWideNarrow className="h-4 w-4" />
            <span className="sr-only">Sắp xếp</span>
            <select value={sort} onChange={(e) => onSortChange(e.target.value as MenuSortKey)} className="bg-transparent text-sm outline-none" aria-label="Sắp xếp thực đơn">
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = activeCategory === category;
          return (
            <button key={category} type="button" onClick={() => onCategoryChange(category)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-[#c62828] text-white shadow-[0_10px_20px_rgba(198,40,40,0.18)]" : "bg-[#fff7f6] text-[#6f5752] hover:bg-[#f6ecea]"}`}>
              {category}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {error ? <div className="rounded-2xl border border-[#f2d1d1] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#b42318]">{error}</div> : null}
        {loading ? <div className="rounded-[24px] border border-dashed border-[#e8d8d3] bg-[#fcfaf9] p-8 text-center text-sm text-[#9d7f79]">Đang tải thực đơn...</div> : null}
        {!loading && items.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#e8d8d3] bg-[#fcfaf9] p-8 text-center">
            <h3 className="text-lg font-extrabold text-[#251714]">{emptyTitle}</h3>
            <p className="mt-2 text-sm text-[#9d7f79]">{emptyDescription}</p>
          </div>
        ) : null}
        {!loading && items.length > 0 ? (
          <div className="mt-0 grid grid-cols-1 gap-3 md:hidden">
            {items.map((item) => (
              <article key={item.id} className="rounded-[24px] border border-[#f0e3df] bg-[#fffdfc] p-4 shadow-[0_8px_24px_rgba(97,39,25,0.04)]">
                <div className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f8f2f1] ring-1 ring-[#edded9]">
                    {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" /> : <div className="flex h-full w-full items-center justify-center text-xl font-black text-[#c62828]">{item.name.slice(0, 1).toUpperCase()}</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-extrabold text-[#261815]">{item.name}</h3>
                    <p className="mt-1 text-sm text-[#9d7f79]">{item.description || "Không có mô tả"}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#f8f2f1] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#8a6f69]">{item.category}</span><span className="text-lg font-black text-[#c62828]">{formatCurrency(item.price)}</span></div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#f3e8e5] pt-4">
                  {renderActions ? renderActions(item) : onAction ? (
                    <button type="button" onClick={() => onAction(item)} className="inline-flex items-center gap-2 rounded-2xl bg-[#c62828] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#c62828]/20 transition hover:bg-[#a61f1f]">
                      <Plus className="h-4 w-4" />
                      {actionLabel}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
