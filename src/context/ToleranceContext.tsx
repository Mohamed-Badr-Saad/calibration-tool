import { useEffect, useState, type ReactNode } from "react";
import { ToleranceAPI } from "@/api";
import { ToleranceContext } from "@/CustomHooks/useTolerance";
import type { ToleranceSettings } from "@/types/index";

export const ToleranceProvider = ({ children }: { children: ReactNode }) => {
  const [tolerances, setTolerances] = useState<ToleranceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ToleranceAPI.get();
      setTolerances(data);
    } catch (err) {
      console.error('Error fetching tolerances:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tolerances');
    } finally {
      setLoading(false);
    }
  };

  const updateTolerance = async (data: Partial<ToleranceSettings>) => {
    try {
      setError(null);
      const updated = await ToleranceAPI.update(data);
      setTolerances(updated);
    } catch (err) {
      console.error('Error updating tolerances:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update tolerances';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <ToleranceContext.Provider 
      value={{ 
        tolerances, 
        loading, 
        error, 
        updateTolerance, 
        refresh 
      }}
    >
      {children}
    </ToleranceContext.Provider>
  );
};
