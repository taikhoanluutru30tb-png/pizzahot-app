"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Minus, Plus, ShoppingBag, ShoppingCart, Truck, User2, X } from "lucide-react";

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  accent: string;
};

type CartItem = Product & {
  quantity: number;
};

type CustomerInfo = {
  name: string;
  phone: string;
  note: string;
  address: string;
};

const products: Product[] = [
  {
    id: "pizza-hai-san",
    name: "Pizza Hải Sản",
    category: "Pizza",
    description: "Mực, tôm, thanh cua và phô mai mozzarella béo ngậy.",
    price: 189000,
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
    accent: "from-rose-500 to-orange-500",
  },
  {
    id: "pizza-bo-nuong",
    name: "Pizza Bò Nướng BBQ",
    category: "Pizza",
    description: "Bò nướng mềm, sốt BBQ đậm vị, viền bánh giòn rụm.",
    price: 179000,
    image:
      "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80",
    accent: "from-amber-500 to-red-500",
  },
  {
    id: "pizza-pho-mai",
    name: "Pizza 5 Loại Phô Mai",
    category: "Pizza",
    description: "Kết hợp mozzarella, cheddar, parmesan và phô mai xanh.",
    price: 155000,
    image:
      "https://images.unsplash.com/photo-1548365328-9f547fb09533?auto=format&fit=crop&w=900&q=80",
    accent: "from-yellow-500 to-orange-500",
  },
  {
    id: "coca-cola",
    name: "Coca Cola 1.5L",
    category: "Đồ uống",
    description: "Thức uống mát lạnh, phù hợp cho bữa ăn gia đình.",
    price: 25000,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80",
    accent: "from-sky-500 to-cyan-500",
  },
  {
    id: "tra-chanh",
    name: "Trà Chanh",
    category: "Đồ uống",
    description: "Vị chua ngọt tươi mát, dễ uống và giải khát tốt.",
    price: 29000,
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80",
    accent: "from-lime-500 to-emerald-500",
  },
  {
    id: "khoai-tay",
    name: "Khoai Tây Chiên",
    category: "Món phụ",
    description: "Miếng khoai vàng giòn, ăn kèm sốt phô mai hoặc tương cà.",
    price: 39000,
    image:
      "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=900&q=80",
    accent: "from-amber-400 to-yellow-500",
  },
];

const categories = ["Tất cả", "Pizza", "Đồ uống", "Món phụ"];

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export default function CreateOrderPage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    note: "",
    address: "",
  });

  const visibleProducts = useMemo(() => {
    if (activeCategory === "Tất cả") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const shipping = subtotal >= 300000 || subtotal === 0 ? 0 : 20000;
  const total = subtotal + shipping;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const decreaseItem = (id: string) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const increaseItem = (id: string) => {
    setCart((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
    );
  };

  const removeItem = (id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const updateCustomer = (field: keyof CustomerInfo, value: string) => {
    setCustomer((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="pb-24 lg:pb-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#fff1f0] px-3 py-1 text-xs font-semibold text-[#c62828] ring-1 ring-[#f7c9c6]">
            <ShoppingBag className="h-3.5 w-3.5" />
            POS bán hàng
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#2b1715] sm:text-4xl">Tạo đơn hàng</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#8b6d67]">
            Chọn món từ thực đơn, quản lý giỏ hàng và nhập thông tin khách hàng ngay trên một màn hình.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#4b3a37] shadow-[0_10px_30px_rgba(17,24,39,0.06)] ring-1 ring-[#efe3e0] transition hover:bg-[#fff8f7]"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
        <main className="space-y-6">
          <section className="rounded-[28px] bg-white p-4 shadow-[0_12px_40px_rgba(17,24,39,0.06)] ring-1 ring-[#f4e9e7] sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#2b1715]">Thực đơn</h2>
                <p className="mt-1 text-sm text-[#8b6d67]">Chọn món để thêm nhanh vào giỏ hàng.</p>
              </div>
              <div className="hidden items-center gap-2 rounded-full bg-[#fff7f5] px-3 py-2 text-xs font-medium text-[#8b6d67] sm:flex">
                <Truck className="h-4 w-4 text-[#c62828]" />
                Giao hàng / Mang đi
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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              {visibleProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[24px] bg-[#fffaf9] ring-1 ring-[#f2e7e4] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(17,24,39,0.08)]"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${product.accent} opacity-20`} />
                    <span className="absolute left-4 top-4 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {product.category}
                    </span>
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#2b1715]">{product.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#8b6d67]">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg font-black text-[#c62828]">{formatCurrency(product.price)}</div>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#c62828] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#c62828]/20 transition hover:bg-[#a61f1f]"
                      >
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

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <section className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(17,24,39,0.06)] ring-1 ring-[#f4e9e7]">
              <div className="mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#c62828]" />
                <h2 className="text-xl font-bold text-[#2b1715]">Giỏ hàng</h2>
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
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="truncate font-semibold text-[#2b1715]">{item.name}</h3>
                              <p className="text-sm text-[#8b6d67]">{formatCurrency(item.price)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="rounded-full p-1.5 text-[#9d807a] transition hover:bg-[#fff1f0] hover:text-[#c62828]"
                              aria-label={`Xóa ${item.name}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center rounded-full bg-white p-1 ring-1 ring-[#eadedb]">
                              <button
                                type="button"
                                onClick={() => decreaseItem(item.id)}
                                className="grid h-8 w-8 place-items-center rounded-full text-[#7d625d] transition hover:bg-[#fff1f0]"
                                aria-label={`Giảm ${item.name}`}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="min-w-9 px-2 text-center text-sm font-bold text-[#2b1715]">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => increaseItem(item.id)}
                                className="grid h-8 w-8 place-items-center rounded-full text-[#7d625d] transition hover:bg-[#fff1f0]"
                                aria-label={`Tăng ${item.name}`}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-sm font-bold text-[#2b1715]">
                              {formatCurrency(item.price * item.quantity)}
                            </div>
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
                  <span className="font-semibold text-[#2b1715]">
                    {shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-[#eadedb] pt-3">
                  <span className="text-base font-bold text-[#2b1715]">Tổng tiền</span>
                  <span className="text-xl font-black text-[#c62828]">{formatCurrency(total)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(17,24,39,0.06)] ring-1 ring-[#f4e9e7]">
              <div className="mb-4 flex items-center gap-2">
                <User2 className="h-5 w-5 text-[#c62828]" />
                <h2 className="text-xl font-bold text-[#2b1715]">Thông tin khách hàng</h2>
              </div>

              <div className="grid gap-3">
                <input
                  value={customer.name}
                  onChange={(event) => updateCustomer("name", event.target.value)}
                  placeholder="Tên khách hàng"
                  className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]"
                />
                <input
                  value={customer.phone}
                  onChange={(event) => updateCustomer("phone", event.target.value)}
                  placeholder="Số điện thoại"
                  className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]"
                />
                <textarea
                  value={customer.note}
                  onChange={(event) => updateCustomer("note", event.target.value)}
                  placeholder="Ghi chú"
                  rows={3}
                  className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]"
                />
                <textarea
                  value={customer.address}
                  onChange={(event) => updateCustomer("address", event.target.value)}
                  placeholder="Địa chỉ giao hàng"
                  rows={3}
                  className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]"
                />
              </div>
            </section>
          </div>
        </aside>
      </div>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="fixed inset-x-4 bottom-4 z-20 flex items-center justify-between gap-3 rounded-[24px] bg-[#c62828] px-4 py-4 text-white shadow-[0_20px_40px_rgba(198,40,40,0.3)]"
        >
          <span className="inline-flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold">Giỏ hàng</span>
              <span className="block text-xs text-white/80">{totalItems} món • {formatCurrency(total)}</span>
            </span>
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#c62828]">
            Mở thanh toán
          </span>
        </button>
      </div>

      {isCartOpen ? (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setIsCartOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-[#fffdfc] p-4 shadow-[0_-16px_40px_rgba(17,24,39,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[#eadedb]" />

            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#c62828]" />
                <h2 className="text-lg font-bold text-[#2b1715]">Giỏ hàng</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-full p-2 text-[#7d625d] transition hover:bg-[#fff1f0]"
                aria-label="Đóng giỏ hàng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {cart.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#ead7d3] bg-[#fffaf9] px-4 py-10 text-center text-sm text-[#9d807a]">
                  Chưa có món nào được chọn.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-[#fffaf9] p-3 ring-1 ring-[#f1e4e1]">
                    <div className="flex items-start gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="truncate font-semibold text-[#2b1715]">{item.name}</h3>
                            <p className="text-sm text-[#8b6d67]">{formatCurrency(item.price)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="rounded-full p-1.5 text-[#9d807a] transition hover:bg-[#fff1f0] hover:text-[#c62828]"
                            aria-label={`Xóa ${item.name}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-full bg-white p-1 ring-1 ring-[#eadedb]">
                            <button
                              type="button"
                              onClick={() => decreaseItem(item.id)}
                              className="grid h-8 w-8 place-items-center rounded-full text-[#7d625d] transition hover:bg-[#fff1f0]"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-9 px-2 text-center text-sm font-bold text-[#2b1715]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => increaseItem(item.id)}
                              className="grid h-8 w-8 place-items-center rounded-full text-[#7d625d] transition hover:bg-[#fff1f0]"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-sm font-bold text-[#2b1715]">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 space-y-4 border-t border-[#f2e5e2] pt-4">
              <div className="grid gap-3 rounded-[24px] bg-white p-4 ring-1 ring-[#f4e9e7]">
                <div className="flex items-center gap-2">
                  <User2 className="h-5 w-5 text-[#c62828]" />
                  <h3 className="text-base font-bold text-[#2b1715]">Thông tin khách hàng</h3>
                </div>
                <input
                  value={customer.name}
                  onChange={(event) => updateCustomer("name", event.target.value)}
                  placeholder="Tên khách hàng"
                  className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]"
                />
                <input
                  value={customer.phone}
                  onChange={(event) => updateCustomer("phone", event.target.value)}
                  placeholder="Số điện thoại"
                  className="h-12 rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]"
                />
                <textarea
                  value={customer.note}
                  onChange={(event) => updateCustomer("note", event.target.value)}
                  placeholder="Ghi chú"
                  rows={3}
                  className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]"
                />
                <textarea
                  value={customer.address}
                  onChange={(event) => updateCustomer("address", event.target.value)}
                  placeholder="Địa chỉ giao hàng"
                  rows={3}
                  className="rounded-2xl border border-[#eadedb] bg-[#fffaf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b99f99] focus:border-[#c62828]"
                />
              </div>

              <div className="rounded-[24px] bg-white p-4 ring-1 ring-[#f4e9e7]">
                <div className="flex items-center justify-between text-sm text-[#7d625d]">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-[#2b1715]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-[#7d625d]">
                  <span>Phí giao hàng</span>
                  <span className="font-semibold text-[#2b1715]">
                    {shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#eadedb] pt-3">
                  <span className="text-base font-bold text-[#2b1715]">Tổng tiền</span>
                  <span className="text-xl font-black text-[#c62828]">{formatCurrency(total)}</span>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-[#c62828] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-[#c62828]/20 transition hover:bg-[#a61f1f]"
                >
                  Thanh toán đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
