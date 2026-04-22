"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  User2,
  X,
} from "lucide-react";
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";

type MenuItem = {
  id: string;
  ten_mon?: string;
  ten?: string;
  gia_tien?: number;
  gia?: number;
  image?: string;
  hinh_anh?: string;
  danh_muc?: string;
  mo_ta?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  description?: string;
};

type CartItem = Product & { quantity: number };

type CustomerForm = {
  name: string;
  phone: string;
  address: string;
  note: string;
};

const categories = ["Tất cả", "Pizza", "Đồ uống", "Món phụ"] as const;
const assignTargets = ["Không gán", "Shipper #01", "Shipper #02", "Chi nhánh Quận 1", "Chi nhánh Quận 7"] as const;

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function normalizeMenuItem(docItem: MenuItem): Product {
  return {
    id: docItem.id,
    name: docItem.ten_mon || docItem.ten || "Chưa đặt tên",
    price: Number(docItem.gia_tien ?? docItem.gia ?? 0),
    image: docItem.image || docItem.hinh_anh || undefined,
    category: docItem.danh_muc || "Khác",
    description: docItem.mo_ta || "",
  };
}

export default function AdminCreateOrderPage() {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("Tất cả");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerForm>({ name: "", phone: "", address: "", note: "" });
  const [assignTo, setAssignTo] = useState<(typeof assignTargets)[number]>("Không gán");
  const [menu, setMenu] = useState<Product[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [toast, setToast] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "menu"), (snapshot) => {
      const items = snapshot.docs.map((docItem) => normalizeMenuItem({ id: docItem.id, ...(docItem.data() as Omit<MenuItem, "id">) }));
      setMenu(items);
      setLoadingMenu(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const visibleProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return menu.filter((product) => {
      const matchesCategory = activeCategory === "Tất cả" || product.category === activeCategory;
      const matchesSearch =
        keyword.length === 0 || [product.name, product.description || "", product.category || ""].some((value) => value.toLowerCase().includes(keyword));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, menu, search]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const total = subtotal;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (!existing) return [...current, { ...product, quantity: 1 }];
      return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (id: string) => setCart((current) => current.filter((item) => item.id !== id));
  const updateCustomer = (field: keyof CustomerForm, value: string) => setCustomer((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setCart([]);
    setCustomer({ name: "", phone: "", address: "", note: "" });
    setAssignTo("Không gán");
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;
    if (!customer.name.trim() || !customer.phone.trim()) {
      setToast("Vui lòng nhập Tên khách hàng và Số điện thoại.");
      return;
    }

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, "orders"), {
        khach_hang: {
          ten: customer.name.trim(),
          sdt: customer.phone.trim(),
          dia_chi: customer.address.trim(),
          ghi_chu: customer.note.trim(),
        },
        danh_sach_mon: cart.map((item) => ({
          id: item.id,
          ten_mon: item.name,
          gia_tien: item.price,
          so_luong: item.quantity,
          thanh_tien: item.price * item.quantity,
        })),
        tong_tien: total,
        trang_thai: "Chờ xử lý",
        nguoi_tao: auth.currentUser?.uid || "Admin",
        thoi_gian_tao: serverTimestamp(),
      });

      window.alert("Tạo đơn hàng thành công!");
      setToast("Tạo đơn hàng thành công!");
      resetForm();
    } catch (error) {
      console.error("Create order failed:", error);
      setToast("Không thể tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f4] pb-28 text-[#2b1715]">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 rounded-2xl bg-[#2b1715] px-4 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      ) : null}

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="rounded-[28px] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-black/5 lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1f0] px-3 py-1 text-xs font-semibold text-[#c62828] ring-1 ring-[#f4c8c4]">
                <Sparkles className="h-3.5 w-3.5" />
                Admin POS
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight lg:text-4xl">Tạo đơn hàng</h1>
              <p className="max-w-2xl text-sm text-[#8b6d67] lg:text-base">
                Chọn món từ Firestore, quản lý giỏ hàng và tạo đơn hàng trực tiếp lên Firebase.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#c62828] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#c62828]/20 transition hover:bg-[#a61f1f]"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr] lg:items-start">
          <main className="space-y-6">
            <section className="rounded-[28px] bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-black/5 lg:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">Danh sách thực đơn</h2>
                  <p className="mt-1 text-sm text-[#8b6d67]">Dữ liệu được lấy realtime từ collection `menu`.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fff7f5] px-3 py-2 text-xs font-medium text-[#8b6d67]">
                  <ShoppingBag className="h-4 w-4 text-[#c62828]" />
                  {visibleProducts.length} món
                </div>
              </div>

              <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
                <label className="flex h-12 items-center gap-3 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm text-[#7d625d]">
                  <Search className="h-4 w-4 text-[#c62828]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tìm món"
                    className="w-full bg-transparent outline-none placeholder:text-[#b99f99]"
                  />
                </label>
                <div className="inline-flex items-center justify-between rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm text-[#7d625d] md:min-w-56">
                  <span>{totalItems} món trong giỏ</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>

              <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => {
                  const isActive = category === activeCategory;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-[#c62828] text-white shadow-lg shadow-[#c62828]/20"
                          : "bg-[#fff7f6] text-[#7d625d] ring-1 ring-[#f0e3e0] hover:bg-[#fff1ef]"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {loadingMenu ? (
                <div className="rounded-3xl border border-dashed border-[#ead7d3] bg-[#fffaf9] px-4 py-10 text-center text-sm text-[#9d807a]">
                  Đang tải thực đơn...
                </div>
              ) : visibleProducts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#ead7d3] bg-[#fffaf9] px-4 py-10 text-center text-sm text-[#9d807a]">
                  Chưa có món nào phù hợp.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                  {visibleProducts.map((product) => (
                    <article
                      key={product.id}
                      className="group overflow-hidden rounded-[24px] bg-[#fffaf9] ring-1 ring-[#f2e7e4] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(17,24,39,0.08)]"
                    >
                      <div className="relative h-44 overflow-hidden">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#fff1f0] to-[#ffe9e5] text-4xl font-black text-[#c62828]">
                            {product.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                        <span className="absolute left-4 top-4 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                          {product.category || "Khác"}
                        </span>
                      </div>

                      <div className="space-y-3 p-4">
                        <div>
                          <h3 className="text-lg font-bold">{product.name}</h3>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="text-lg font-black text-[#c62828]">{formatCurrency(product.price)}</div>
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#c62828] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#c62828]/20 transition hover:bg-[#a61f1f]"
                          >
                            <Plus className="h-4 w-4" />
                            Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </main>

          <aside className="hidden space-y-6 lg:block lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-black/5">
              <div className="mb-4 flex items-center gap-2">
                <User2 className="h-5 w-5 text-[#c62828]" />
                <h2 className="text-xl font-bold">Thông tin khách hàng</h2>
              </div>

              <div className="grid gap-3">
                <label className="grid gap-2 text-sm font-medium text-[#694f49]">
                  Tên khách hàng
                  <input value={customer.name} onChange={(event) => updateCustomer("name", event.target.value)} placeholder="Nhập tên khách hàng" className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#694f49]">
                  Số điện thoại
                  <input value={customer.phone} onChange={(event) => updateCustomer("phone", event.target.value)} placeholder="Nhập số điện thoại" className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#694f49]">
                  Địa chỉ giao hàng
                  <textarea value={customer.address} onChange={(event) => updateCustomer("address", event.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện..." rows={3} className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#694f49]">
                  Ghi chú
                  <textarea value={customer.note} onChange={(event) => updateCustomer("note", event.target.value)} placeholder="Ví dụ: Giao sau 18h" rows={3} className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
                </label>
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-black/5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[#c62828]" />
                  <h2 className="text-xl font-bold">Giỏ hàng</h2>
                </div>
                <span className="rounded-full bg-[#fff7f5] px-3 py-1 text-xs font-semibold text-[#b4534c]">{totalItems} món</span>
              </div>

              {cart.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#ead7d3] bg-[#fffaf9] px-4 py-10 text-center text-sm text-[#9d807a]">
                  Chưa có món nào được chọn.
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-[#fffaf9] p-3 ring-1 ring-[#f1e4e1]">
                      <div className="flex items-start gap-3">
                        <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
                          {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-[#ffe9e5] font-bold text-[#c62828]">{item.name.slice(0, 1)}</div>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="truncate font-semibold text-[#2b1715]">{item.name}</h3>
                              <p className="text-sm text-[#8b6d67]">{formatCurrency(item.price)}</p>
                            </div>
                            <button type="button" onClick={() => removeItem(item.id)} className="rounded-full p-1.5 text-[#9d807a] transition hover:bg-[#fff1f0] hover:text-[#c62828]" aria-label={`Xóa ${item.name}`}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center rounded-full bg-white p-1 ring-1 ring-[#eadedb]">
                              <button type="button" onClick={() => updateQuantity(item.id, -1)} className="grid h-8 w-8 place-items-center rounded-full text-[#7d625d] transition hover:bg-[#fff1f0]" aria-label={`Giảm ${item.name}`}>
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="min-w-9 px-2 text-center text-sm font-bold text-[#2b1715]">{item.quantity}</span>
                              <button type="button" onClick={() => updateQuantity(item.id, 1)} className="grid h-8 w-8 place-items-center rounded-full text-[#7d625d] transition hover:bg-[#fff1f0]" aria-label={`Tăng ${item.name}`}>
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-sm font-bold text-[#2b1715]">{formatCurrency(item.price * item.quantity)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 space-y-3 border-t border-[#f2e5e2] pt-4 text-sm">
                <div className="flex items-center justify-between text-[#7d625d]">
                  <span>Tổng tiền</span>
                  <span className="font-semibold text-[#2b1715]">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="mt-5 space-y-3 rounded-[24px] bg-[#fffaf9] p-4 ring-1 ring-[#f4e9e7]">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#2b1715]">
                  <Truck className="h-4 w-4 text-[#c62828]" />
                  Gán đơn cho Admin
                </div>
                <label className="grid gap-2 text-sm font-medium text-[#694f49]">
                  <span className="sr-only">Gán đơn cho shipper hoặc chi nhánh</span>
                  <div className="relative">
                    <select value={assignTo} onChange={(event) => setAssignTo(event.target.value as (typeof assignTargets)[number])} className="h-12 w-full appearance-none rounded-2xl border border-[#eadedb] bg-white px-4 pr-11 text-sm outline-none transition focus:border-[#c62828]">
                      {assignTargets.map((target) => (
                        <option key={target} value={target}>
                          {target}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b6d67]" />
                  </div>
                </label>
                <div className="flex items-start gap-2 rounded-2xl bg-white px-3 py-3 text-xs text-[#8b6d67] ring-1 ring-[#f2e5e2]">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#c62828]" />
                  <p>Admin có thể gán đơn trực tiếp cho shipper hoặc chi nhánh để điều phối xử lý nhanh hơn.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={cart.length === 0 || isSubmitting}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c62828] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-[#c62828]/20 transition hover:bg-[#a61f1f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Đang tạo đơn..." : "Tạo đơn"}
              </button>
            </section>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-20 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex w-full items-center justify-between gap-3 rounded-[24px] bg-[#c62828] px-4 py-4 text-white shadow-[0_20px_40px_rgba(198,40,40,0.3)]"
        >
          <span className="inline-flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold">Giỏ hàng</span>
              <span className="block text-xs text-white/80">
                {totalItems} món • {formatCurrency(total)}
              </span>
            </span>
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#c62828]">Mở</span>
        </button>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-[#fffdfc] p-4 shadow-[0_-16px_40px_rgba(17,24,39,0.2)]" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#eadedb]" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#c62828]" />
                <h2 className="text-lg font-bold text-[#2b1715]">Giỏ hàng & thanh toán</h2>
              </div>
              <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-full p-2 text-[#7d625d] transition hover:bg-[#fff1f0]" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>

            <section className="space-y-3 rounded-[24px] bg-white p-4 ring-1 ring-[#f4e9e7]">
              <div className="flex items-center gap-2">
                <User2 className="h-5 w-5 text-[#c62828]" />
                <h3 className="text-base font-bold text-[#2b1715]">Thông tin khách hàng</h3>
              </div>
              <input value={customer.name} onChange={(event) => updateCustomer("name", event.target.value)} placeholder="Tên khách hàng" className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
              <input value={customer.phone} onChange={(event) => updateCustomer("phone", event.target.value)} placeholder="Số điện thoại" className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
              <textarea value={customer.address} onChange={(event) => updateCustomer("address", event.target.value)} placeholder="Địa chỉ giao hàng chi tiết" rows={3} className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
              <textarea value={customer.note} onChange={(event) => updateCustomer("note", event.target.value)} placeholder="Ghi chú" rows={3} className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
            </section>

            <section className="mt-4 space-y-3 rounded-[24px] bg-white p-4 ring-1 ring-[#f4e9e7]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#2b1715]">
                <Truck className="h-4 w-4 text-[#c62828]" />
                Gán đơn cho Admin
              </div>
              <div className="relative">
                <select value={assignTo} onChange={(event) => setAssignTo(event.target.value as (typeof assignTargets)[number])} className="h-12 w-full appearance-none rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 pr-11 text-sm outline-none transition focus:border-[#c62828]">
                  {assignTargets.map((target) => (
                    <option key={target} value={target}>
                      {target}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b6d67]" />
              </div>
            </section>

            <div className="mt-4 space-y-3">
              {cart.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#ead7d3] bg-[#fffaf9] px-4 py-10 text-center text-sm text-[#9d807a]">Chưa có món nào được chọn.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-[#fffaf9] p-3 ring-1 ring-[#f1e4e1]">
                    <div className="flex items-start gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
                        {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-[#ffe9e5] font-bold text-[#c62828]">{item.name.slice(0, 1)}</div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-[#2b1715]">{item.name}</h3>
                            <p className="text-sm text-[#8b6d67]">{formatCurrency(item.price)}</p>
                          </div>
                          <button type="button" onClick={() => removeItem(item.id)} className="rounded-full p-1.5 text-[#9d807a] transition hover:bg-[#fff1f0] hover:text-[#c62828]" aria-label={`Xóa ${item.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-full bg-white p-1 ring-1 ring-[#eadedb]">
                            <button type="button" onClick={() => updateQuantity(item.id, -1)} className="grid h-8 w-8 place-items-center rounded-full text-[#7d625d] transition hover:bg-[#fff1f0]">
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-9 px-2 text-center text-sm font-bold text-[#2b1715]">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.id, 1)} className="grid h-8 w-8 place-items-center rounded-full text-[#7d625d] transition hover:bg-[#fff1f0]">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-sm font-bold text-[#2b1715]">{formatCurrency(item.price * item.quantity)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 rounded-[24px] bg-white p-4 ring-1 ring-[#f4e9e7]">
              <div className="flex items-center justify-between text-sm text-[#7d625d]">
                <span>Tổng tiền</span>
                <span className="font-semibold text-[#2b1715]">{formatCurrency(total)}</span>
              </div>

              <button type="button" onClick={handleCreateOrder} disabled={cart.length === 0 || isSubmitting} className="mt-4 w-full rounded-2xl bg-[#c62828] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-[#c62828]/20 transition hover:bg-[#a61f1f] disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? "Đang tạo đơn..." : "Tạo đơn"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
