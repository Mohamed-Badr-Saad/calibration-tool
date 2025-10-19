import { useEffect, useState, type ReactNode } from "react";
import { InstrumentAPI } from "@/api";
import { InstrumentContext } from "@/CustomHooks/useInstruments";
import type { Instrument } from "../types";

export const InstrumentsProvider = ({ children }: { children: ReactNode }) => {
  const [instruments, setInstruments] = useState<Instrument[] | null>(null);

  const refresh = async () => {
    const data = await InstrumentAPI.getAll();
    setInstruments(data);
  };

  const addInstrument = async (instrument: Instrument) => {
    const created = await InstrumentAPI.create(instrument);
    setInstruments((prev) => (prev ? [...prev, created] : [created]));
  };

  const updateInstrument = async (id: string, instrument: Instrument) => {
    const updated = await InstrumentAPI.update(id, instrument);
    setInstruments((prev) =>
      prev ? prev.map((i) => (i._id === id ? updated : i)) : [updated]
    );
  };

  const removeInstrument = async (id: string) => {
    await InstrumentAPI.remove(id);
    setInstruments((prev) => prev?.filter((i) => i._id !== id) || null);
  };

  // 👇 fetch instruments once when provider mounts
  useEffect(() => {
    refresh();
  }, []);

  return (
    <InstrumentContext.Provider
      value={{
        instruments,
        addInstrument,
        updateInstrument,
        removeInstrument,
        refresh,
      }}
    >
      {children}
    </InstrumentContext.Provider>
  );
};
