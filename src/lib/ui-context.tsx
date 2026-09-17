"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type FontSize = "normal" | "large";

interface UIContextType {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  fontSize: FontSize;
  toggleFontSize: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const UIContext = createContext<UIContextType>({
  sidebarOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  searchOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
  fontSize: "normal",
  toggleFontSize: () => {},
  darkMode: false,
  toggleDarkMode: () => {},
});

const FONT_SIZE_KEY = "fontSize";
const DARK_MODE_KEY = "darkMode";

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(FONT_SIZE_KEY);
    if (stored === "large") setFontSize("large");
    if (localStorage.getItem(DARK_MODE_KEY) === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("font-size-lg", fontSize === "large");
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Lock body scroll while the mobile drawer or search overlay is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen || searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen, searchOpen]);

  const toggleFontSize = () => {
    setFontSize((prev) => {
      const next = prev === "normal" ? "large" : "normal";
      localStorage.setItem(FONT_SIZE_KEY, next);
      return next;
    });
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem(DARK_MODE_KEY, String(next));
      return next;
    });
  };

  return (
    <UIContext.Provider
      value={{
        sidebarOpen,
        openSidebar: () => setSidebarOpen(true),
        closeSidebar: () => setSidebarOpen(false),
        searchOpen,
        openSearch: () => setSearchOpen(true),
        closeSearch: () => setSearchOpen(false),
        fontSize,
        toggleFontSize,
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
