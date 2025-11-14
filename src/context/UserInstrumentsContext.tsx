import React, { useState, useCallback, useEffect } from "react";
import { InstrumentAPI } from "@/api"; // Replace with actual path
import type { Instrument } from "@/types";
import { UserInstrumentsContext } from "@/CustomHooks/useUserInstruments";

export const UserInstrumentsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInstruments = async () => {
    setLoading(true);
    const data = await InstrumentAPI.getAll();
    setInstruments(data);
    setLoading(false);
  };

  // 👇 fetch instruments once when provider mounts
  useEffect(() => {
    fetchInstruments();
  }, []);

  return (
    <UserInstrumentsContext.Provider
      value={{ instruments, loading, fetchInstruments }}
    >
      {children}
    </UserInstrumentsContext.Provider>
  );
};
