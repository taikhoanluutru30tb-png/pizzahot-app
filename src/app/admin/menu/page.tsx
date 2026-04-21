"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ChefHat,
  Edit3,
  Filter,
  LucideIcon,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";

type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  featured?: boolean;
  description: string;
};

const categories = ["Tất cả", "Pizza", "Burgers", "Drinks", "Sides"] as const;

const menuItems: MenuItem[] = [
  {
    id: "PH-1029",
    name: "Pizza Phô Mai Hảo Hạng",
    category: "Pizza",
    price: 189000,
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=640&q=80",
    featured: true,
    description: "Pizza • Bestseller",
  },
  {
    id: "BG-2044",
    name: "Burger Bò Mỹ Phô Mai",
    category: "Burgers",
    price: 125000,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=640&q=80",
    description: "Burger • Popular",
  },
  {
    id: "DR-8821",
    name: "Nước Ép Cam Nguyên Chất",
    category: "Drinks",
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=640&q=80",
    description: "Drinks • Fresh",
  },
  {
    id: "SD-4410",
    name: "Khoai Tây Chiên Giòn",
    category: "Sides",
    price: 59000,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=640&q=80",
    description: "Sides • Snack",
  },
  {
    id: "PZ-5512",
    name: "Pizza Hải Sản Đế Mỏng",
    category: "Pizza",
    price: 229000,
    image:
      "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=640&q=80",
    description: "Pizza • Premium",
  },
  {
    id: "DR-7602",
    name: "Soda Chanh Mát Lạnh",
    category: "Drinks",
    price: 39000,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=640&q=80",
    description: "Drinks • Sparkling",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

function ActionButton({ icon: Icon, label, tone = "neutral" }: { icon: LucideIcon; label: string; tone?: "neutral" | "danger" }) {
  return (
    <button
      type="button"
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
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("Tất cả");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === "Tất cả" || item.category === activeCategory;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <main className="space-y-5 pb-4 text-[#4b342f] sm:space-y-6 lg:space-y-8">
      <section className="rounded-[28px] border border-[#efdfdc] bg-white p-4 shadow-[0_12px_40px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#b28b84]">Quản lý thực đơn</p>
            <h1 className="mt-2 text-[clamp(1.7rem,4vw,2.6rem)] font-black tracking-tight text-[#241614]">Menu Management</h1>
            <p className="mt-2 text-sm text-[#9b7d78] lg:text-base">
              Tìm kiếm, thêm mới, chỉnh sửa và xóa món ăn. Giao diện tối ưu desktop với table, mobile chuyển sang card để không bị tràn ngang.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c62828] px-5 py-3.5 font-bold text-white shadow-[0_12px_24px_rgba(198,40,40,0.22)] transition hover:bg-[#a91f1f]"
            >
              <Plus className="h-4 w-4" />
              Thêm món mới
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#efdfdc] bg-white p-4 shadow-[0_12px_40px_rgba(97,39,25,0.06)] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff0ef] text-[#c62828]">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#251714]">Danh sách món ăn</h2>
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
                placeholder="Tìm tên món, mã món..."
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
                <th className="px-4 py-4">Mã</th>
                <th className="px-4 py-4">Danh mục</th>
                <th className="px-4 py-4">Giá</th>
                <th className="px-4 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f6eeeb] bg-white">
              {filteredItems.map((item) => (
                <tr key={item.id} className="align-middle transition hover:bg-[#fffdfc]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-14 rounded-2xl object-cover ring-1 ring-[#edded9]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-[#261815]">{item.name}</p>
                          {item.featured ? (
                            <span className="rounded-full bg-[#fff0ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c62828]">
                              Nổi bật
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-[#9d7f79]">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#7e6560]">#{item.id}</td>
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
                        className="inline-flex items-center gap-2 rounded-xl border border-[#eadad5] bg-white px-3 py-2 text-sm font-semibold text-[#6f5752] transition hover:bg-[#faf6f5]"
                      >
                        <Edit3 className="h-4 w-4" />
                        Sửa
                      </button>
                      <button
                        type="button"
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
                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover ring-1 ring-[#edded9]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-extrabold text-[#261815]">{item.name}</h3>
                        {item.featured ? (
                          <span className="rounded-full bg-[#fff0ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c62828]">
                            Nổi bật
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-[#9d7f79]">{item.description}</p>
                    </div>
                    <span className="shrink-0 rounded-xl bg-[#fff0ef] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#c62828]">
                      #{item.id}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-[#f8f2f1] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#8a6f69]">
                      {item.category}
                    </span>
                    <span className="text-lg font-black text-[#c62828]">{formatCurrency(item.price)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#f3e8e5] pt-4">
                <ActionButton icon={Edit3} label={`Sửa ${item.name}`} />
                <ActionButton icon={Trash2} label={`Xóa ${item.name}`} tone="danger" />
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
            <p className="mt-2 text-sm text-[#9d7f79]">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc danh mục.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
