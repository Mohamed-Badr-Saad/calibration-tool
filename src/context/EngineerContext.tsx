import { useEffect, useState, type ReactNode } from "react";
import { EngineerAPI } from "@/api";
import { EngineerContext } from "@/CustomHooks/useEngineers";
import type { Engineer } from "../types";

export const EngineersProvider = ({ children }: { children: ReactNode }) => {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refresh = async () => {
    setLoading(true);

    const data = await EngineerAPI.getAll();
    setEngineers(data);
    setLoading(false);
  };

  const addEngineer = async (name: string) => {
    setLoading(true);

    const newEng = await EngineerAPI.create({ name });
    setEngineers((prev) => [...prev, newEng]);
    setLoading(false);
  };

  const updateEngineer = async (id: string, name: string) => {
    setLoading(true);

    const updated = await EngineerAPI.update(id, { name });
    setEngineers((prev) => prev.map((e) => (e._id === id ? updated : e)));
    setLoading(false);
  };

  const removeEngineer = async (id: string) => {
    setLoading(true);

    await EngineerAPI.remove(id);
    setEngineers((prev) => prev.filter((e) => e._id !== id));
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);
  return (
    <EngineerContext.Provider
      value={{
        engineers,
        addEngineer,
        updateEngineer,
        removeEngineer,
        refresh,
        loading,
      }}
    >
      {children}
    </EngineerContext.Provider>
  );
};
