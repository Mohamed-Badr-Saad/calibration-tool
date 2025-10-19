import React, { useState, useCallback } from "react";
import { InstrumentAPI } from "@/api"; // Replace with actual path
import type { Instrument } from "@/types";
import { UserInstrumentsContext } from "@/CustomHooks/useUserInstruments";



export const UserInstrumentsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInstruments = useCallback(async () => {
    if (instruments.length > 0) return; // Prevent refetch unless needed
    setLoading(true);
    try {
      const data = await InstrumentAPI.getAll(); // API call to get instruments
      setInstruments(data);
    } finally {
      setLoading(false);
    }
  }, [instruments]);

  return (
    <UserInstrumentsContext.Provider
      value={{ instruments, loading, fetchInstruments }}
    >
      {children}
    </UserInstrumentsContext.Provider>
  );
};

