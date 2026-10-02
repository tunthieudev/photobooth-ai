import { create } from "zustand";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export type Language = "vi" | "en";

interface UIState {
  theme: "dark" | "light";
  language: Language;
  isSidebarOpen: boolean;
  activeModal: string | null;
  modalData: any;
  activeDrawer: string | null;
  isBottomSheetOpen: boolean;
  toasts: ToastItem[];
  
  // Actions
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
  openDrawer: (drawerId: string) => void;
  closeDrawer: () => void;
  setBottomSheetOpen: (isOpen: boolean) => void;
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
}

// Initial theme preference lookup (defaults to "dark")
const getInitialTheme = (): "dark" | "light" => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("photobooth_theme") as "dark" | "light";
    if (saved === "dark" || saved === "light") return saved;
  }
  return "dark";
};

// Initial language preference lookup (defaults to "vi")
const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("photobooth_lang") as Language;
    if (saved === "vi" || saved === "en") return saved;
  }
  return "vi";
};

const applyThemeToDOM = (theme: "dark" | "light") => {
  if (typeof window !== "undefined") {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("photobooth_theme", theme);
  }
};

export const useUIStore = create<UIState>((set, get) => ({
  theme: getInitialTheme(),
  language: getInitialLanguage(),
  isSidebarOpen: false,
  activeModal: null,
  modalData: null,
  activeDrawer: null,
  isBottomSheetOpen: false,
  toasts: [],

  setLanguage: (language: Language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("photobooth_lang", language);
    }
    set({ language });
  },

  toggleTheme: () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    applyThemeToDOM(newTheme);
    set({ theme: newTheme });
  },

  setTheme: (theme) => {
    applyThemeToDOM(theme);
    set({ theme });
  },
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openModal: (modalId, data = null) => set({ activeModal: modalId, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  openDrawer: (drawerId) => set({ activeDrawer: drawerId }),
  closeDrawer: () => set({ activeDrawer: null }),
  setBottomSheetOpen: (isOpen) => set({ isBottomSheetOpen: isOpen }),
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration || 4000);
    }
    return id;
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
