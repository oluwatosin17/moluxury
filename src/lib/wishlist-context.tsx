"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

const STORAGE_KEY = "moluxury_wishlist";

export interface WishlistItem {
  name: string;
  price: string;
  src: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  isOpen: boolean;
  toggleItem: (item: WishlistItem) => void;
  isLiked: (name: string) => boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after first hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems((prev) =>
      prev.some((i) => i.name === item.name)
        ? prev.filter((i) => i.name !== item.name)
        : [...prev, item]
    );
  }, []);

  const isLiked = useCallback(
    (name: string) => items.some((i) => i.name === name),
    [items]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        isOpen,
        toggleItem,
        isLiked,
        openWishlist: () => setIsOpen(true),
        closeWishlist: () => setIsOpen(false),
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
