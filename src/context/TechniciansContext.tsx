import {  useEffect, useState, type ReactNode } from "react";
import { TechnicianAPI } from "@/api";
import { TechnicianContext } from "@/CustomHooks/useTechnicians";
import type { Technician } from "@/types/index";


export const TechniciansProvider = ({ children }: { children: ReactNode }) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  const refresh = async () => {
    const data = await TechnicianAPI.getAll();
    setTechnicians(data);
  };

  const addTechnician = async (name: string) => {
    const newTech = await TechnicianAPI.create({ name } as Technician);
    setTechnicians((prev) => [...prev, newTech]);
  };

  const updateTechnician = async (id: string, name: string) => {
    const updated = await TechnicianAPI.update(id, { name });
    setTechnicians((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const removeTechnician = async (id: string) => {
    await TechnicianAPI.remove(id);
    setTechnicians((prev) => prev.filter((t) => t._id !== id));
  };
  useEffect(() => {
    refresh();
  }, []);
  return (
    <TechnicianContext.Provider value={{ technicians, addTechnician, updateTechnician, removeTechnician, refresh }}>
      {children}
    </TechnicianContext.Provider>
  );
};

