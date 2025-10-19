import type { Instrument } from "@/types";
import { createContext, useContext } from "react";


interface InstrumentsContextType {
  instruments: Instrument[];
  loading: boolean;
  fetchInstruments: () => Promise<void>;
}

export const UserInstrumentsContext = createContext<InstrumentsContextType | undefined>(
  undefined
);
export function useUserInstrumentsContext() {
  const context = useContext(UserInstrumentsContext);
  if (!context) {
    throw new Error(
      "useInstrumentsContext must be used within an InstrumentsProvider"
    );
  }
  return context;
}
