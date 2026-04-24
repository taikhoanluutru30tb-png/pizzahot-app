"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  Trash2,
  User2,
} from "lucide-react";
import { doc, getDoc, collection, onSnapshot, query, where, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";

import { auth, db } from "@/app/lib/firebase";
import { MenuListSection } from "@/app/components/menu-list-section";
import { filterAndSortMenuItems, useMenuItems, type MenuItem, type MenuSortKey } from "@/app/lib/use-menu-items";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
};

type CartItem = Product & { quantity: number };

type CustomerForm = {
  name: string;
  phone: string;
  address: string;
  note: string;
};

type OrderItem = {
  danh_sach_mon?: unknown;
  tong_tien?: unknown;
  phan_loai?: unknown;
  category?: unknown;
  ten_mon?: unknown;
  name?: unknown;
  gia_tien?: unknown;
  price?: unknown;
  thanh_tien?: unknown;
  so_luong?: unknown;
  quantity?: unknown;
};

type UserProfile = {
  nhom_ctv?: unknown;
};

type Category = "Tất cả" | "Pizza" | "Đồ uống" | "Món phụ";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value) || 0;
}

function isPizzaItem(item: OrderItem) {
  const category = toText(item.phan_loai || item.category).toLowerCase();
  const name = toText(item.ten_mon || item.name).toLowerCase();
  return category === "pizza" || name.includes("pizza");
}

export default function CtvCreateOrderPage() {
  const { menuItems, categories: menuCategories, loading, error: menuError } = useMenuItems();
  const [activeCategory, setActiveCategory] = useState<Category>("Tất cả");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<MenuSortKey>("recommended");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerForm>({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [completedOrders, setCompletedOrders] = useState<OrderItem[]>([]);
  const [currentUserGroup, setCurrentUserGroup] = useState<string>("");
  const commissionLoading = completedOrders.length === 0;

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      return;
    }

    let isActive = true;

    getDoc(doc(db, "users", uid))
      .then((snapshot) => {
        if (!isActive) return;
        const data = (snapshot.data() || {}) as UserProfile;
        setCurrentUserGroup(toText(data.nhom_ctv).toLowerCase());
      })
      .catch((error) => {
        console.error("Failed to load CTV profile:", error);
        if (isActive) setCurrentUserGroup("");
      })
      .finally(() => {
        if (isActive) {
          // loading state is derived from data subscription lifecycle
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      return;
    }

    const ordersQuery = query(
      collection(db, "orders"),
      where("nguoi_tao", "==", uid),
      where("trang_thai", "==", "Hoàn thành"),
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        setCompletedOrders(snapshot.docs.map((docSnapshot: QueryDocumentSnapshot<DocumentData>) => ({ id: docSnapshot.id, ...(docSnapshot.data() as OrderItem) })));
      },
      (snapshotError) => {
        console.error("Failed to subscribe to completed orders:", snapshotError);
        setCompletedOrders([]);
      },
    );

    return unsubscribe;
  }, []);

  const visibleProducts = useMemo(() => {
    return filterAndSortMenuItems(menuItems, { search, category: activeCategory, sort });
  }, [activeCategory, menuItems, search, sort]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const shipping = subtotal === 0 || subtotal >= 300000 ? 0 : 20000;
  const total = subtotal + shipping;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const commissionTotal = useMemo(() => {
    return completedOrders.reduce((sum, order) => {
      const orderBase = toNumber(order.tong_tien) * 0.1;
      const items = Array.isArray(order.danh_sach_mon) ? order.danh_sach_mon : [];
      const pizzaTotal = items.reduce((pizzaSum, item) => {
        if (!isPizzaItem(item)) return pizzaSum;
        const lineTotal = toNumber(item.thanh_tien) || toNumber(item.gia_tien) * toNumber(item.so_luong || item.quantity || 1);
        return pizzaSum + lineTotal;
      }, 0);
      const bonusRate = currentUserGroup === "vip" ? 0.08 : 0.05;
      return sum + orderBase + pizzaTotal * bonusRate;
    }, 0);
  }, [completedOrders, currentUserGroup]);

  const addToCart = (product: MenuItem) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (!existing) return [...current, { ...product, quantity: 1 }];
      return current.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      );
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

  return (
    <div className="min-h-screen bg-[#faf6f4] pb-28 text-[#2b1715]">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="rounded-[28px] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-black/5 lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1f0] px-3 py-1 text-xs font-semibold text-[#c62828] ring-1 ring-[#f4c8c4]">
                <Sparkles className="h-3.5 w-3.5" />
                Affiliate / CTV
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight lg:text-4xl">Tạo đơn hàng</h1>
              <p className="max-w-2xl text-sm text-[#8b6d67] lg:text-base">
                Chọn món, nhập thông tin khách và kiểm tra giỏ hàng trước khi lưu đơn.
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
            <MenuListSection
              title="Chọn món"
              subtitle="Tìm món nhanh và thêm vào giỏ bằng nút +."
              items={visibleProducts}
              categories={menuCategories}
              activeCategory={activeCategory}
              onCategoryChange={(category) => setActiveCategory(category as Category)}
              search={search}
              onSearchChange={setSearch}
              sort={sort}
              onSortChange={setSort}
              countLabel={`${visibleProducts.length} món`}
              loading={loading}
              error={menuError}
              emptyDescription="Chưa có món nào phù hợp."
              actionLabel="Thêm món"
              onAction={addToCart}
            />

            <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-black/5 lg:p-6">
              <div className="mb-4 flex items-center gap-2">
                <User2 className="h-5 w-5 text-[#c62828]" />
                <h2 className="text-xl font-bold">Thông tin khách</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-[#694f49]">
                  Tên
                  <input
                    value={customer.name}
                    onChange={(event) => updateCustomer("name", event.target.value)}
                    placeholder="Nhập tên khách"
                    className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#694f49]">
                  SĐT
                  <input
                    value={customer.phone}
                    onChange={(event) => updateCustomer("phone", event.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#694f49] sm:col-span-2">
                  Địa chỉ chi tiết
                  <textarea
                    value={customer.address}
                    onChange={(event) => updateCustomer("address", event.target.value)}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
                    rows={3}
                    className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#694f49] sm:col-span-2">
                  Ghi chú
                  <textarea
                    value={customer.note}
                    onChange={(event) => updateCustomer("note", event.target.value)}
                    placeholder="Ví dụ: giao sau 18h, thêm tương ớt..."
                    rows={3}
                    className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]"
                  />
                </label>
              </div>
            </section>
          </main>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-black/5">
              <div className="mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#c62828]" />
                <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
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
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
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
                  ))}
                </div>
              )}

              <div className="mt-5 space-y-3 border-t border-[#f2e5e2] pt-4 text-sm">
                <div className="flex items-center justify-between text-[#7d625d]">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-[#2b1715]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[#7d625d]">
                  <span>Phí giao hàng</span>
                  <span className="font-semibold text-[#2b1715]">{shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-[#eadedb] pt-3">
                  <span className="text-base font-bold text-[#2b1715]">Tổng tiền</span>
                  <span className="text-xl font-black text-[#c62828]">{formatCurrency(total)}</span>
                </div>
              </div>

              <button type="button" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c62828] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-[#c62828]/20 transition hover:bg-[#a61f1f]">
                Lưu đơn hàng
              </button>
            </section>

            <section className="rounded-[28px] bg-[#1f2937] p-5 text-white shadow-[0_10px_30px_rgba(17,24,39,0.12)] ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white/70">Hoa hồng tạm tính</p>
                  <h3 className="text-2xl font-black text-[#ffd36b]">{commissionLoading ? "Đang tải..." : formatCurrency(commissionTotal)}</h3>
                </div>
                <div className="rounded-2xl bg-white/10 px-3 py-2 text-right text-xs text-white/80">
                  <div>Đơn hoàn thành</div>
                  <div className="font-semibold text-white">{completedOrders.length}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-white/75">
                Chỉ hiển thị cho CTV. Hoa hồng = 10% tổng tiền đơn + thưởng pizza theo nhóm {currentUserGroup === "vip" ? "VIP 8%" : "thường 5%"}.
              </p>
            </section>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#eddeda] bg-white/95 p-4 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-7xl space-y-4 px-0">
          <section className="rounded-[24px] bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.05)] ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#2b1715]">Menu món</p>
                <p className="text-xs text-[#8b6d67]">Ưu tiên hiển thị trước trên mobile</p>
              </div>
              <span className="rounded-full bg-[#fff7f5] px-3 py-1 text-xs font-semibold text-[#c62828]">
                {visibleProducts.length} món
              </span>
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c62828] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-[#c62828]/20"
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems} món • {formatCurrency(total)}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#eadedb] bg-white px-4 py-4 text-sm font-bold text-[#2b1715]"
            >
              Lưu đơn hàng
            </button>
          </div>

          <section className="rounded-[24px] bg-[#1f2937] p-4 text-white shadow-[0_10px_30px_rgba(17,24,39,0.12)] ring-1 ring-black/5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Hoa hồng tạm tính</p>
            <div className="mt-1 text-2xl font-black text-[#ffd36b]">
              {commissionLoading ? "Đang tải..." : formatCurrency(commissionTotal)}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
