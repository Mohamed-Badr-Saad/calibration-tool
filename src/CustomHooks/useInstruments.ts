  import { useContext,createContext } from "react";
  import type { Instrument } from "@/types/index";

  interface InstrumentContextType {
    instruments: Instrument[] | null;
    addInstrument: (instrument: Instrument) => Promise<void>;
    updateInstrument: (id: string, instrument: Instrument) => Promise<void>;
    removeInstrument: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
    loading: boolean;
  }

  export const InstrumentContext = createContext<InstrumentContextType | undefined>(undefined);

  export const useInstrumentsContext = () => {
    const context = useContext(InstrumentContext);
    if (!context) throw new Error("useInstrumentsContext must be used within InstrumentProvider");
    return context;
  };
