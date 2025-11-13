import type { Technician } from "@/types/index";
import { createContext, useContext } from "react";

interface TechnicianContextType {
  technicians: Technician[];
  loading: boolean;
  addTechnician: (name: string) => Promise<void>;
  updateTechnician: (id: string, name: string) => Promise<void>;
  removeTechnician: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const TechnicianContext = createContext<
  TechnicianContextType | undefined
>(undefined);

export const useTechnicians = () => {
  const context = useContext(TechnicianContext);
  if (!context)
    throw new Error("useTechnicians must be used within TechnicianProvider");
  return context;
};
