"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import {
  ArrowLeft,
  ChevronDown,
  Clock3,
  FileText,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  User2,
  X,
} from "lucide-react";

import { auth, db } from "@/app/lib/firebase";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
};

type CartItem = MenuItem & { quantity: number };

type CustomerForm = {
  ten: string;
  sdt: string;
  dia_chi: string;
  ghi_chu: string;
};

const categories = ["Tất cả"];

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export default function StaffCreateOrderPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerForm>({
    ten: "",
    sdt: "",
    dia_chi: "",
    ghi_chu: "",
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "menu"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((document) => {
          const data = document.data();
          return {
            id: document.id,
            name: String(data.name ?? ""),
            price: Number(data.price ?? 0),
            category: String(data.category ?? ""),
            description: String(data.description ?? ""),
            imageUrl: String(data.imageUrl ?? ""),
          } satisfies MenuItem;
        });
        setMenuItems(items);
      },
      (snapshotError) => setError(snapshotError.message || "Không thể tải thực đơn."),
    );

    return () => unsubscribe();
  }, []);

  const visibleProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return menuItems.filter((product) => {
      const matchesCategory = activeCategory === "Tất cả" || product.category === activeCategory;
      const matchesSearch =
        keyword.length === 0 ||
        [product.name, product.description, product.category].some((value) => value.toLowerCase().includes(keyword));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, menuItems, search]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const total = subtotal;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: MenuItem) => {
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

  const updateCustomer = (field: keyof CustomerForm, value: string) => {
    setCustomer((current) => ({ ...current, [field]: value }));
  };

  async function handleCreateOrder(event: FormEvent<HTMLFormElement> | FormEvent<HTMLButtonElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (cart.length === 0) {
      setError("Vui lòng chọn ít nhất một món trước khi đặt hàng.");
      return;
    }

    if (!customer.ten.trim() || !customer.sdt.trim()) {
      setError("Vui lòng nhập Tên khách hàng và Số điện thoại.");
      return;
    }

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, "orders"), {
        khach_hang: {
          ten: customer.ten.trim(),
          sdt: customer.sdt.trim(),
          dia_chi: customer.dia_chi.trim(),
          ghi_chu: customer.ghi_chu.trim(),
        },
        danh_sach_mon: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
          description: item.description,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
        })),
        tong_tien: total,
        trang_thai: "Chờ xử lý",
        nguoi_tao: auth.currentUser?.uid ?? null,
        thoi_gian_tao: serverTimestamp(),
      });

      setCart([]);
      setCustomer({ ten: "", sdt: "", dia_chi: "", ghi_chu: "" });
      setMessage("Tạo đơn hàng thành công.");
      setDrawerOpen(false);
      window.alert("Tạo đơn hàng thành công.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể tạo đơn hàng.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openCartDrawer() {
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-6 pb-28 lg:space-y-8 lg:pb-8">
      <header className="flex items-start justify-between gap-4 rounded-[28px] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-black/5 lg:p-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1f0] px-3 py-1 text-xs font-semibold text-[#c62828] ring-1 ring-[#f4c8c4]">
            <Sparkles className="h-3.5 w-3.5" />
            POS nhân viên
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#2b1715] lg:text-4xl">Tạo đơn hàng</h1>
          <p className="max-w-2xl text-sm text-[#8b6d67] lg:text-base">
            Menu được đồng bộ realtime từ Firestore, giỏ hàng và thông tin khách sẽ được lưu vào collection orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#c62828] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#c62828]/20 transition hover:bg-[#a61f1f]"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
      </header>

      {error ? <div className="rounded-2xl border border-[#f2d1d1] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#b42318]">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-[#d9f0df] bg-[#f3fbf5] px-4 py-3 text-sm font-medium text-[#1f7a39]">{message}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <main className="space-y-6">
          <section className="rounded-[28px] bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-black/5 lg:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#2b1715]">Thực đơn</h2>
                <p className="mt-1 text-sm text-[#8b6d67]">Danh sách món ăn được lấy trực tiếp từ Firestore collection `menu`.</p>
              </div>
              <div className="hidden items-center gap-2 rounded-full bg-[#fff7f5] px-3 py-2 text-xs font-medium text-[#8b6d67] md:flex">
                <Clock3 className="h-4 w-4 text-[#c62828]" />
                Realtime update
              </div>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="flex h-12 items-center gap-3 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm text-[#7d625d]">
                <Search className="h-4 w-4 text-[#c62828]" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm món, ví dụ: Pizza" className="w-full bg-transparent outline-none placeholder:text-[#b99f99]" />
              </label>
              <div className="inline-flex items-center justify-between rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm text-[#7d625d] md:min-w-56">
                <span>{visibleProducts.length} món</span>
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

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
              {visibleProducts.map((product) => (
                <article key={product.id} className="group overflow-hidden rounded-[24px] bg-[#fffaf9] ring-1 ring-[#f2e7e4] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(17,24,39,0.08)]">
                  <div className="relative h-48 overflow-hidden">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{product.category}</span>
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#2b1715]">{product.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#8b6d67]">{product.description || "Không có mô tả"}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg font-black text-[#c62828]">{formatCurrency(product.price)}</div>
                      <button type="button" onClick={() => addToCart(product)} className="inline-flex items-center gap-2 rounded-2xl bg-[#c62828] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#c62828]/20 transition hover:bg-[#a61f1f]">
                        <Plus className="h-4 w-4" />
                        Thêm món
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="hidden space-y-6 lg:block lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-black/5">
            <div className="mb-4 flex items-center gap-2">
              <User2 className="h-5 w-5 text-[#c62828]" />
              <h2 className="text-xl font-bold text-[#2b1715]">Thông tin khách hàng</h2>
            </div>

            <form className="grid gap-3" onSubmit={handleCreateOrder}>
              <label className="grid gap-2 text-sm font-medium text-[#694f49]">
                Tên khách hàng
                <input value={customer.ten} onChange={(event) => updateCustomer("ten", event.target.value)} placeholder="Nhập tên khách hàng" className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#694f49]">
                Số điện thoại
                <input value={customer.sdt} onChange={(event) => updateCustomer("sdt", event.target.value)} placeholder="Nhập số điện thoại" className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#694f49]">
                Địa chỉ giao hàng
                <textarea value={customer.dia_chi} onChange={(event) => updateCustomer("dia_chi", event.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện..." rows={3} className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#694f49]">
                Ghi chú
                <textarea value={customer.ghi_chu} onChange={(event) => updateCustomer("ghi_chu", event.target.value)} placeholder="Ví dụ: Giao sau 18h..." rows={3} className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
              </label>

              <div className="mt-2 space-y-3 border-t border-[#f2e5e2] pt-4 text-sm">
                <div className="flex items-center justify-between text-[#7d625d]"><span>Tạm tính</span><span className="font-semibold text-[#2b1715]">{formatCurrency(subtotal)}</span></div>
                <div className="flex items-center justify-between border-t border-dashed border-[#eadedb] pt-3"><span className="text-base font-bold text-[#2b1715]">Tổng tiền</span><span className="text-xl font-black text-[#c62828]">{formatCurrency(total)}</span></div>
              </div>

              <button type="submit" disabled={isSubmitting} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c62828] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-[#c62828]/20 transition hover:bg-[#a61f1f] disabled:cursor-not-allowed disabled:opacity-70">
                <FileText className="h-4 w-4" />
                {isSubmitting ? "Đang xử lý..." : "Thanh toán / Đặt hàng"}
              </button>
            </form>
          </section>

          <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-black/5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#c62828]" />
                <h2 className="text-xl font-bold text-[#2b1715]">Giỏ hàng</h2>
              </div>
              <span className="rounded-full bg-[#fff7f5] px-3 py-1 text-xs font-semibold text-[#b4534c]">{totalItems} món</span>
            </div>

            {cart.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#ead7d3] bg-[#fffaf9] px-4 py-10 text-center text-sm text-[#9d807a]">Chưa có món nào được chọn.</div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-[#fffaf9] p-3 ring-1 ring-[#f1e4e1]">
                    <div className="flex items-start gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0"><h3 className="truncate font-semibold text-[#2b1715]">{item.name}</h3><p className="text-sm text-[#8b6d67]">{formatCurrency(item.price)}</p></div>
                          <button type="button" onClick={() => removeItem(item.id)} className="rounded-full p-1.5 text-[#9d807a] transition hover:bg-[#fff1f0] hover:text-[#c62828]" aria-label={`Xóa ${item.name}`}><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-full bg-white p-1 ring-1 ring-[#eadedb]">
                            <button type="button" onClick={() => updateQuantity(item.id, -1)} className="grid h-8 w-8 place-items-center rounded-full text-[#7d625d] transition hover:bg-[#fff1f0]"><Minus className="h-4 w-4" /></button>
                            <span className="min-w-9 px-2 text-center text-sm font-bold text-[#2b1715]">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.id, 1)} className="grid h-8 w-8 place-items-center rounded-full text-[#7d625d] transition hover:bg-[#fff1f0]"><Plus className="h-4 w-4" /></button>
                          </div>
                          <div className="text-sm font-bold text-[#2b1715]">{formatCurrency(item.price * item.quantity)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-20 lg:hidden">
        <button type="button" onClick={openCartDrawer} className="flex w-full items-center justify-between gap-3 rounded-[24px] bg-[#c62828] px-4 py-4 text-white shadow-[0_20px_40px_rgba(198,40,40,0.3)]">
          <span className="inline-flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20"><ShoppingBag className="h-5 w-5" /></span><span className="text-left"><span className="block text-sm font-semibold">Giỏ hàng</span><span className="block text-xs text-white/80">{totalItems} món • {formatCurrency(total)}</span></span></span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#c62828]">Mở</span>
        </button>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-[#fffdfc] p-4 shadow-[0_-16px_40px_rgba(17,24,39,0.2)]" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#eadedb]" />
            <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-[#c62828]" /><h2 className="text-lg font-bold text-[#2b1715]">Giỏ hàng & khách hàng</h2></div><button type="button" onClick={() => setDrawerOpen(false)} className="rounded-full p-2 text-[#7d625d] transition hover:bg-[#fff1f0]" aria-label="Đóng"><X className="h-5 w-5" /></button></div>
            <section className="space-y-3 rounded-[24px] bg-white p-4 ring-1 ring-[#f4e9e7]">
              <div className="flex items-center gap-2"><User2 className="h-5 w-5 text-[#c62828]" /><h3 className="text-base font-bold text-[#2b1715]">Thông tin khách hàng</h3></div>
              <input value={customer.ten} onChange={(event) => updateCustomer("ten", event.target.value)} placeholder="Tên khách hàng" className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
              <input value={customer.sdt} onChange={(event) => updateCustomer("sdt", event.target.value)} placeholder="Số điện thoại" className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
              <textarea value={customer.dia_chi} onChange={(event) => updateCustomer("dia_chi", event.target.value)} placeholder="Địa chỉ giao hàng chi tiết" rows={3} className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
              <textarea value={customer.ghi_chu} onChange={(event) => updateCustomer("ghi_chu", event.target.value)} placeholder="Ghi chú" rows={3} className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]" />
            </section>

            <div className="mt-4 space-y-3">
              {cart.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#ead7d3] bg-[#fffaf9] px-4 py-10 text-center text-sm text-[#9d807a]">Chưa có món nào được chọn.</div>
              ) : cart.map((item) => (
                <div key={item.id} className="rounded-2xl bg-[#fffaf9] p-3 ring-1 ring-[#f1e4e1]">
                  <div className="flex items-start gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl"><Image src={item.imageUrl} alt={item.name} fill className="object-cover" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate font-semibold text-[#2b1715]">{item.name}</h3><p className="text-sm text-[#8b6d67]">{formatCurrency(item.price)}</p></div><button type="button" onClick={() => removeItem(item.id)} className="rounded-full p-1.5 text-[#9d807a] transition hover:bg-[#fff1f0] hover:text-[#c62828]" aria-label={`Xóa ${item.name}`}><Trash2 className="h-4 w-4" /></button></div>
                      <div className="mt-3 flex items-center justify-between gap-3"><div className="inline-flex items-center rounded-full bg-white p-1 ring-1 ring-[#eadedb]"><button type="button" onClick={() => updateQuantity(item.id, -1)} className="grid h-8 w-8 place-items-center rounded-full text-[#7d625d] transition hover:bg-[#fff1f0]"><Minus className="h-4 w-4" /></button><span className="min-w-9 px-2 text-center text-sm font-bold text-[#2b1715]">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, 1)} className="grid h-8 w-8 place-items-center rounded-full text-[#7d625d] transition hover:bg-[#fff1f0]"><Plus className="h-4 w-4" /></button></div><div className="text-sm font-bold text-[#2b1715]">{formatCurrency(item.price * item.quantity)}</div></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form className="mt-4 rounded-[24px] bg-white p-4 ring-1 ring-[#f4e9e7]" onSubmit={handleCreateOrder}>
              <div className="flex items-center justify-between text-sm text-[#7d625d]"><span>Tạm tính</span><span className="font-semibold text-[#2b1715]">{formatCurrency(subtotal)}</span></div>
              <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#eadedb] pt-3"><span className="text-base font-bold text-[#2b1715]">Tổng tiền</span><span className="text-xl font-black text-[#c62828]">{formatCurrency(total)}</span></div>
              <button type="submit" disabled={isSubmitting} className="mt-4 w-full rounded-2xl bg-[#c62828] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-[#c62828]/20 transition hover:bg-[#a61f1f] disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? "Đang xử lý..." : "Thanh toán / Đặt hàng"}</button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
