"use client";

import { createContext, useContext, useState } from "react";

type NekoContextType = {
  showNeko: boolean;
  setShowNeko: (v: boolean) => void;
};

const NekoContext = createContext<NekoContextType | null>(null);

export function NekoProvider({ children }: { children: React.ReactNode }) {
  const [showNeko, setShowNeko] = useState(false);

  return (
    <NekoContext.Provider value={{ showNeko, setShowNeko }}>
      {children}
    </NekoContext.Provider>
  );
}

export function useNeko() {
  const ctx = useContext(NekoContext);
  if (!ctx) throw new Error("useNeko must be used inside NekoProvider");
  return ctx;
}