import {  useEffect, useState, type ReactNode } from "react";
import { EngineerAPI } from "@/api";
import { EngineerContext } from "@/CustomHooks/useEngineers";
import type { Engineer } from "../types";


export const EngineersProvider = ({ children }: { children: ReactNode }) => {
  const [engineers, setEngineers] = useState<Engineer[]>([]);

  const refresh = async () => {
    const data = await EngineerAPI.getAll();
    setEngineers(data);
  };

  const addEngineer = async (name: string) => {
    const newEng = await EngineerAPI.create({ name });
    setEngineers((prev) => [...prev, newEng]);
  };

  const updateEngineer = async (id: string, name: string) => {
    const updated = await EngineerAPI.update(id, { name });
    setEngineers((prev) => prev.map((e) => (e._id === id ? updated : e)));
  };

  const removeEngineer = async (id: string) => {
    await EngineerAPI.remove(id);
    setEngineers((prev) => prev.filter((e) => e._id !== id));
  };
  useEffect(() => {
    refresh();
  }, []);
  return (
    <EngineerContext.Provider value={{ engineers, addEngineer, updateEngineer, removeEngineer, refresh }}>
      {children}
    </EngineerContext.Provider>
  );
};


