"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CartItem {
  name: string;
  price: string;
  priceNum: number;
  src: string;
  slug: string;
  length: string;
  density: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, delta: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

function itemKey(item: Pick<CartItem, "name" | "length" | "density">) {
  return `${item.name}__${item.length}__${item.density}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    const key = itemKey(item);
    setItems((prev) => {
      const existing = prev.find((i) => itemKey(i) === key);
      if (existing) {
        return prev.map((i) => itemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => itemKey(i) !== key));
  }, []);

  const updateQty = useCallback((key: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => itemKey(i) === key ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.priceNum * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isOpen, addItem, removeItem, updateQty, clearCart,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      totalItems, subtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export { itemKey };
