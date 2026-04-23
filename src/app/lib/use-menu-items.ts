"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { db } from "@/app/lib/firebase";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
};

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "menu"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextItems = snapshot.docs.map((document) => {
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

        setMenuItems(nextItems);
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError.message || "Không thể tải thực đơn.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(menuItems.map((item) => item.category).filter(Boolean)));
    return ["Tất cả", ...unique];
  }, [menuItems]);

  return { menuItems, categories, loading, error };
}
