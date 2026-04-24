import { collection, doc, getDoc, onSnapshot, orderBy, query, runTransaction, where, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";

import { db } from "./firebase";

export type OrderStatus = "Chờ xử lý" | "Đang chế biến" | "Đang giao hàng" | "Hoàn tất" | "Đã hủy";

export type OrderLineItem = {
  id?: string;
  name?: string;
  ten_mon?: string;
  price?: number;
  gia_tien?: number;
  quantity?: number;
  so_luong?: number;
  thanh_tien?: number;
  phan_loai?: string;
  category?: string;
};

export type OrderDoc = {
  id: string;
  khach_hang?: {
    ten?: string;
    sdt?: string;
    dia_chi?: string;
    ghi_chu?: string;
  };
  danh_sach_mon?: OrderLineItem[];
  tong_tien?: number;
  trang_thai?: OrderStatus | string;
  nguoi_tao?: string | null;
  nguoi_giao?: string | null;
  tien_hoa_hong?: number;
  thoi_gian_tao?: { seconds: number; nanoseconds: number } | null;
};

export type ShipperOption = {
  uid: string;
  name: string;
};

export type CtvProfile = {
  role?: string;
  nhom_ctv?: string;
};

const ORDER_COLLECTION = collection(db, "orders");

type OrdersSnapshot = {
  docs: QueryDocumentSnapshot<DocumentData>[];
};

export function subscribeOrders(callback: (orders: OrderDoc[]) => void) {
  return onSnapshot(query(ORDER_COLLECTION, orderBy("thoi_gian_tao", "desc")), (snapshot: OrdersSnapshot) => {
    callback(snapshot.docs.map((document) => ({ id: document.id, ...(document.data() as Omit<OrderDoc, "id">) })));
  });
}

export function subscribeShippers(callback: (shippers: ShipperOption[]) => void) {
  return onSnapshot(query(collection(db, "users"), where("role", "==", "shipper")), (snapshot) => {
    callback(
      snapshot.docs.map((document) => {
        const data = document.data() as Record<string, unknown>;
        const name = [data.fullName, data.ten, data.displayName, data.name].find((value): value is string => typeof value === "string" && value.trim().length > 0) ?? document.id;
        return { uid: document.id, name };
      }),
    );
  });
}

export function getOrderStatus(order: OrderDoc): OrderStatus {
  const status = order.trang_thai;
  if (status === "Chờ xử lý" || status === "Đang chế biến" || status === "Đang giao hàng" || status === "Hoàn tất" || status === "Đã hủy") {
    return status;
  }
  return "Chờ xử lý";
}

export function formatOrderId(orderId: string) {
  const digits = orderId.replace(/\D/g, "").slice(-4);
  return digits ? `DH-${digits}` : orderId;
}

export function itemName(item: OrderLineItem) {
  return item.ten_mon || item.name || "Món ăn";
}

export function itemQuantity(item: OrderLineItem) {
  return Number(item.so_luong || item.quantity || 1);
}

export function itemPrice(item: OrderLineItem) {
  return Number(item.gia_tien || item.price || 0);
}

export function itemTotal(item: OrderLineItem) {
  return Number(item.thanh_tien || itemPrice(item) * itemQuantity(item));
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value) || 0;
}

function isPizzaItem(item: OrderLineItem) {
  const category = toText(item.phan_loai || item.category).toLowerCase();
  return category === "pizza";
}

export async function updateOrder(orderId: string, data: Partial<OrderDoc>) {
  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, "orders", orderId);
    const orderSnapshot = await transaction.get(orderRef);
    if (!orderSnapshot.exists()) {
      throw new Error("Đơn hàng không tồn tại.");
    }

    const currentOrder = orderSnapshot.data() as OrderDoc;
    transaction.update(orderRef, data);

    if (data.trang_thai !== "Hoàn tất") {
      return;
    }

    const creatorId = currentOrder.nguoi_tao;
    if (!creatorId) {
      return;
    }

    const creatorSnapshot = await transaction.get(doc(db, "users", creatorId));
    if (!creatorSnapshot.exists()) {
      return;
    }

    const creatorData = creatorSnapshot.data() as CtvProfile & Record<string, unknown>;
    if (toText(creatorData.role).toLowerCase() !== "ctv") {
      return;
    }

    const groupName = toText(creatorData.nhom_ctv).toLowerCase();
    const isVip = groupName === "vip";
    const orderItems = Array.isArray(currentOrder.danh_sach_mon) ? currentOrder.danh_sach_mon : [];
    const totalValue = toNumber(currentOrder.tong_tien);
    const pizzaTotal = orderItems.reduce((sum, item) => (isPizzaItem(item) ? sum + itemTotal(item) : sum), 0);
    const baseCommission = totalValue * 0.1;
    const pizzaBonus = pizzaTotal * (isVip ? 0.08 : 0.05);
    const commission = Math.round((baseCommission + pizzaBonus) * 100) / 100;

    transaction.update(orderRef, { tien_hoa_hong: commission });
  });
}

export async function loadUserName(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid));
  const data = snapshot.data() as Record<string, unknown> | undefined;
  return [data?.fullName, data?.ten, data?.displayName, data?.name].find((value): value is string => typeof value === "string" && value.trim().length > 0) ?? uid;
}
