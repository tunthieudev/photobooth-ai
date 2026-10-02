import { useUIStore } from "@/stores/useUIStore";

export function useToast() {
  const { addToast, removeToast } = useUIStore();

  return {
    toast: addToast,
    success: (message: string) => addToast({ type: "success", message }),
    error: (message: string) => addToast({ type: "error", message }),
    warning: (message: string) => addToast({ type: "warning", message }),
    info: (message: string) => addToast({ type: "info", message }),
    dismiss: removeToast,
  };
}
