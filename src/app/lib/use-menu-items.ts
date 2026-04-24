"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

import { db } from "@/app/lib/firebase";

export function formatOrderId(id: string) {
  const digits = id.replace(/\D/g, "");
  return digits.length > 0 ? `DH-${digits.slice(-4)}` : id.toUpperCase();
}

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
};

export type MenuSortKey = "recommended" | "price-asc" | "price-desc" | "name-asc";

export type MenuFilterState = {
  search: string;
  category: string;
  sort: MenuSortKey;
};

const DEFAULT_CATEGORIES = ["Tất cả", "Pizza", "Đồ uống", "Món phụ"];

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value) || 0;
}

function normalizeMenuItem(id: string, data: Record<string, unknown>): MenuItem {
  return {
    id,
    name: toText(data.name) || "Chưa đặt tên",
    price: toNumber(data.price),
    category: toText(data.category) || "Khác",
    description: toText(data.description),
    imageUrl: toText(data.imageUrl || data.image) || "",
  };
}

export function filterAndSortMenuItems(items: MenuItem[], filters: MenuFilterState) {
  const keyword = filters.search.trim().toLowerCase();

  const filtered = items.filter((item) => {
    const matchesCategory = filters.category === "Tất cả" || item.category === filters.category;
    const matchesSearch =
      keyword.length === 0 ||
      [item.name, item.description, item.category].some((value) => value.toLowerCase().includes(keyword));

    return matchesCategory && matchesSearch;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"));
      break;
    default:
      break;
  }

  return sorted;
}

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const menuQuery = query(collection(db, "menu"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      menuQuery,
      (snapshot) => {
        setMenuItems(snapshot.docs.map((doc) => normalizeMenuItem(doc.id, doc.data())));
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        console.error("Failed to subscribe to menu items:", snapshotError);
        setError("Không thể tải danh sách thực đơn.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(new Set(menuItems.map((item) => item.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi"));
    return [DEFAULT_CATEGORIES[0], ...Array.from(new Set([...DEFAULT_CATEGORIES.slice(1), ...dynamicCategories]))];
  }, [menuItems]);

  return { menuItems, categories, loading, error };
}
