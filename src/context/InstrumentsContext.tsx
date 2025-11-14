import { useEffect, useState, type ReactNode } from "react";
import { InstrumentAPI } from "@/api";
import { InstrumentContext } from "@/CustomHooks/useInstruments";
import type { Instrument } from "../types";

export const InstrumentsProvider = ({ children }: { children: ReactNode }) => {
  const [instruments, setInstruments] = useState<Instrument[] | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const data = await InstrumentAPI.getAll();
    setInstruments(data);
    setLoading(false);
  };

  const addInstrument = async (instrument: Instrument) => {
    setLoading(true);
    const created = await InstrumentAPI.create(instrument);
    setInstruments((prev) => (prev ? [...prev, created] : [created]));
    setLoading(false);
  };

  const updateInstrument = async (id: string, instrument: Instrument) => {
    setLoading(true);
    const updated = await InstrumentAPI.update(id, instrument);
    setInstruments((prev) =>
      prev ? prev.map((i) => (i._id === id ? updated : i)) : [updated]
    );
    setLoading(false);
  };

  const removeInstrument = async (id: string) => {
    setLoading(true);
    await InstrumentAPI.remove(id);
    setInstruments((prev) => prev?.filter((i) => i._id !== id) || null);
    setLoading(false);
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
        loading
      }}
    >
      {children}
    </InstrumentContext.Provider>
  );
};
