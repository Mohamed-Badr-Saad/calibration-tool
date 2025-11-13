import { useEffect, useState, type ReactNode } from "react";
import { TechnicianAPI } from "@/api";
import { TechnicianContext } from "@/CustomHooks/useTechnicians";
import type { Technician } from "@/types/index";

export const TechniciansProvider = ({ children }: { children: ReactNode }) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refresh = async () => {
    setLoading(true);

    const data = await TechnicianAPI.getAll();
    setTechnicians(data);
    setLoading(false);
  };

  const addTechnician = async (name: string) => {
    setLoading(true);

    const newTech = await TechnicianAPI.create({ name } as Technician);
    setTechnicians((prev) => [...prev, newTech]);
    setLoading(false);
  };

  const updateTechnician = async (id: string, name: string) => {
    setLoading(true);

    const updated = await TechnicianAPI.update(id, { name });
    setTechnicians((prev) => prev.map((t) => (t._id === id ? updated : t)));
    setLoading(false);
  };

  const removeTechnician = async (id: string) => {
    setLoading(true);

    await TechnicianAPI.remove(id);
    setTechnicians((prev) => prev.filter((t) => t._id !== id));
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);
  return (
    <TechnicianContext.Provider
      value={{
        technicians,
        addTechnician,
        updateTechnician,
        removeTechnician,
        refresh,
        loading,
      }}
    >
      {children}
    </TechnicianContext.Provider>
  );
};
