"use client";
import { createContext, useContext, useState } from "react";

interface AdminNavCtx { open: boolean; toggle: () => void; close: () => void; }
const AdminNavContext = createContext<AdminNavCtx>({ open: false, toggle: () => {}, close: () => {} });
export const useAdminNav = () => useContext(AdminNavContext);

export function AdminNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AdminNavContext.Provider value={{ open, toggle: () => setOpen(p => !p), close: () => setOpen(false) }}>
      {children}
    </AdminNavContext.Provider>
  );
}
