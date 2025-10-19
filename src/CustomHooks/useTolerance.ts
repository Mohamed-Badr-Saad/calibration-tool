import type { ToleranceSettings } from "@/types/index";
import { createContext, useContext } from "react";

interface ToleranceContextType {
  tolerances: ToleranceSettings | null;
  loading: boolean;
  error: string | null;
  updateTolerance: (data: Partial<ToleranceSettings>) => Promise<void>;
  refresh: () => Promise<void>;
}

export const ToleranceContext = createContext<ToleranceContextType | undefined>(undefined);

export const useTolerance = () => {
  const context = useContext(ToleranceContext);
  if (!context) throw new Error("useTolerance must be used within ToleranceProvider");
  return context;
};
