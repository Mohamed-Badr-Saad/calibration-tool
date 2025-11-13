import { createContext, useContext } from "react";
import type { Engineer } from "@/types/index";

interface EngineerContextType {
  engineers: Engineer[];
  loading: boolean;
  addEngineer: (name: string) => Promise<void>;
  updateEngineer: (id: string, name: string) => Promise<void>;
  removeEngineer: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const EngineerContext = createContext<EngineerContextType | undefined>(
  undefined
);

export const useEngineers = () => {
  const context = useContext(EngineerContext);
  if (!context)
    throw new Error("useEngineers must be used within EngineerProvider");
  return context;
};
