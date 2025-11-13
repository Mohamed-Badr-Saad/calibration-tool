import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Context Providers
import { InstrumentsProvider } from "./context/InstrumentsContext";
import { EngineersProvider } from "./context/EngineerContext";
import { TechniciansProvider } from "./context/TechniciansContext";
import { AuthProvider } from "./context/AuthContext";

// 🔥 TOAST PROVIDER (for notifications)
import { Toaster } from "@/components/ui/sonner";
import { UserInstrumentsProvider } from "./context/UserInstrumentsContext";
import { ToleranceProvider } from "./context/ToleranceContext";

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}
import { Buffer } from "buffer";
import { UserProvider } from "./context/UserContext";
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <InstrumentsProvider>
            <EngineersProvider>
              <TechniciansProvider>
                <UserInstrumentsProvider>
                  <ToleranceProvider>
                    <App />
                  </ToleranceProvider>
                </UserInstrumentsProvider>
                <Toaster />
              </TechniciansProvider>
            </EngineersProvider>
          </InstrumentsProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
