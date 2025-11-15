import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useInstrumentsContext } from "@/CustomHooks/useInstruments";
import TransmitterPage from "@/pages/calibration/TransmitterPage";
import GaugePage from "@/pages/calibration/GaugePage";
import ControlValvePage from "@/pages/calibration/ControlValvePage";
import { useTechnicians } from "@/CustomHooks/useTechnicians";
import { useEngineers } from "@/CustomHooks/useEngineers";
import { Button } from "@/components/ui/button";
import { PdfDownloadButton } from "@/components/PdfGenerator";
import type { CalibrationFormData, Instrument, Checklist } from "@/types";
import OnOffValvePage from "./OnOffValvePage";
import SwitchPage from "./SwitchPage";
import PCVPage from "./PCVPage";
import { useAuth } from "@/CustomHooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTolerance } from "@/CustomHooks/useTolerance";
const initialChecklist: Checklist = {
  exInspection: "",
  sensorStatus: "",
  tagInstalled: "",
  cableTagInstalled: "",
  cableGlandFixed: "",
  cablePlugCertified: "",
  earthCableConnected: "",
  terminalsTight: "",
  cableScreenNotConnected: "",
  dcsReading: "",
  housingCondition: "",
};

export default function CalibrationPage() {
  const [exportData, setExportData] = useState<CalibrationFormData[] | null>(
    null
  );
  const [startExport, setStartExport] = useState(false);

  const handleExport = () => {
    setExportData(structuredClone(allFormsCompleted));
    setStartExport(true);
  };

  const { user } = useAuth();
  const { tolerances } = useTolerance();
  function createDefaultFormData(instrument: Instrument): CalibrationFormData {
    const lrv = Number(instrument.LRV);
    const urv = Number(instrument.URV);
    const range = urv - lrv;

    // For control valves, use 0-100% values, for others use calculated range
    let upscale: string[], downscale: string[];

    if (instrument["Calibration sheet Form"] === "ControlValve") {
      upscale = [0, 25, 50, 75, 100].map((val) => val.toString());
      downscale = [100, 75, 50, 25, 0].map((val) => val.toString());
    } else {
      upscale = [0, 0.25, 0.5, 0.75, 1].map((p) =>
        Number.isNaN(range) ? "" : (lrv + p * range).toFixed(2)
      );
      downscale = [1, 0.75, 0.5, 0.25, 0].map((p) =>
        Number.isNaN(range) ? "" : (lrv + p * range).toFixed(2)
      );
    }

    return {
      instrumentId: instrument._id!,
      tag: instrument.Tag,
      type: instrument["Calibration sheet Form"],
      rangeFrom: instrument.LRV?.toString() ?? "",
      rangeTo: instrument.URV?.toString() ?? "",
      unit: instrument.Unit || "",
      protocol: "",
      flowTx: "",
      // Initialize gauge-specific fields
      gaugeType: "",
      medium: "",
      sensorType: "",
      measuringSystem: "",
      // Initialize control valve-specific fields
      size: instrument["Valve Size"]?.toString() ?? "",
      // Initialize on/off valve-specific fields
      valveType: "",
      feedbackValueOpen: "",
      feedbackValueClose: "",
      timeOpen: "",
      timeClose: "",
      // Initialize switch-specific fields
      switchType: "",
      testResultActive: "",
      testResultHealthy: "",
      setPointActive: instrument["Switch Active SP"]?.toString() ?? "",
      setPointHealthy: instrument["Switch Healthy SP"]?.toString() ?? "",
      // Initialize PCV-specific fields
      setPoint: instrument["PCV SP"]?.toString() ?? "",
      setPointUnit: instrument["Unit"] || "",
      regulatingTarget: "",
      pcvValveType: "",
      appliedUpscale: upscale,
      actualUpscale: Array(5).fill(""),
      appliedDownscale: downscale,
      actualDownscale: Array(5).fill(""),
      checklist: { ...initialChecklist },
      comments: instrument.Comment || "",
      createdBy: "",
      verifiedBy: user?.name || "",
      date: new Date().toLocaleDateString("en-GB"),
      allHealthy: false,
    };
  }
  const [tech, setTech] = React.useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  const { instruments } = useInstrumentsContext();
  const { technicians } = useTechnicians();
  const { engineers } = useEngineers();

  const [formResults, setFormResults] = useState<
    Record<string, CalibrationFormData>
  >({});
  const instrumentIds: string[] = location.state?.instrumentIds || [];
  const [selectedInstruments, setSelectedInstruments] = useState<Instrument[]>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  function handleFormChange(instrumentId: string, data: CalibrationFormData) {
    setFormResults((prev) => {
      const newResults = { ...prev };
      newResults[instrumentId] = {
        ...data,
        // Add timestamp to force change detection
        lastModified: Date.now(),
      };
      return newResults;
    });
  }

  // Load selected instruments and initialize form data
  useEffect(() => {
    if (instruments) {
      const filtered = instruments.filter((i) =>
        instrumentIds.includes(i._id!)
      );
      setSelectedInstruments(filtered);
      setCurrentIndex(0);

      // Initialize form data for each instrument
      const initialForms: Record<string, CalibrationFormData> = {};
      filtered.forEach((instrument) => {
        initialForms[instrument._id!] = createDefaultFormData(instrument);
      });
      setFormResults(initialForms);
    }
  }, [instruments, instrumentIds]);

  useEffect(() => {
    if (!tech) return;
    setFormResults((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        updated[key] = { ...updated[key], createdBy: tech };
      });
      return updated;
    });
  }, [tech]);
  // Wait for data to load
  if (!instruments || technicians.length === 0 || engineers.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <div className="p-4 text-center w-screen">
          Loading calibration data...
        </div>{" "}
      </div>
    );
  }

  if (selectedInstruments.length === 0) {
    return (
      <div className="p-4 text-center w-sc">
        <p>No instruments selected or invalid selection.</p>
        <Button onClick={() => navigate("/user/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const currentInstrument = selectedInstruments[currentIndex];
  const currentFormData = formResults[currentInstrument._id!];

  const renderForm = () => {
    if (!currentFormData) return <div>Loading form...</div>;

    switch (currentInstrument["Calibration sheet Form"]) {
      case "Transmitter":
        return (
          <TransmitterPage
            instrumentData={currentInstrument}
            tech={tech}
            user={user?.name || "Unknown"}
            formData={currentFormData}
            onFormChange={(data) =>
              handleFormChange(currentInstrument._id!, data)
            }
          />
        );
      case "Gauge":
        return (
          <GaugePage
            instrumentData={currentInstrument}
            tech={tech}
            user={user?.name || "Unknown"}
            formData={currentFormData}
            onFormChange={(data) =>
              handleFormChange(currentInstrument._id!, data)
            }
          />
        );
      case "Control Valve":
        return (
          <ControlValvePage
            instrumentData={currentInstrument}
            tech={tech}
            user={user?.name || "Unknown"}
            formData={currentFormData}
            onFormChange={(data) =>
              handleFormChange(currentInstrument._id!, data)
            }
          />
        );
      case "On-Off Valve": // Add this case
        return (
          <OnOffValvePage
            instrumentData={currentInstrument}
            tech={tech}
            user={user?.name || "Unknown"}
            formData={currentFormData}
            onFormChange={(data) =>
              handleFormChange(currentInstrument._id!, data)
            }
          />
        );
      case "Switch":
        return (
          <SwitchPage
            instrumentData={currentInstrument}
            tech={tech}
            user={user?.name || "Unknown"}
            formData={currentFormData}
            onFormChange={(data) =>
              handleFormChange(currentInstrument._id!, data)
            }
          />
        );
      case "PCV": // Add this case
        return (
          <PCVPage
            instrumentData={currentInstrument}
            tech={tech}
            user={user?.name || "Unknown"}
            formData={currentFormData}
            onFormChange={(data) =>
              handleFormChange(currentInstrument._id!, data)
            }
          />
        );
      // Add other form types here (ControlValve, OnOffValve, etc.)

      default:
        return (
          <p className="text-red-600 font-semibold">
            Unsupported instrument type:{" "}
            {currentInstrument["Calibration sheet Form"]}
          </p>
        );
    }
  };

  const handlePrev = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((i) => Math.min(i + 1, selectedInstruments.length - 1));
  };

  // When rendering the PDF button, create a completely new array
  const allFormsCompleted = Object.values(formResults)
    .filter(Boolean)
    .map((form) => ({ ...form })); // 🔥 Create new object references

  return (
    <div className="flex flex-col justify-center items-center w-screen">
      <div className="p-6 mx-auto space-y-6 max-w-4xl ">
        <h1 className="text-2xl font-bold text-center">
          Calibration for {currentInstrument.Tag} (
          {currentInstrument["Calibration sheet Form"]})
        </h1>

        <div>{renderForm()}</div>
        <div>
          <div className="grid grid-cols-3 gap-4 items-end">
            <Select
              onValueChange={(val) => {
                setTech(val as string);
              }}
            >
              <SelectTrigger
                style={{
                  // backgroundColor: "#fffbe8",
                  border: "1px solid blue",
                  boxShadow: "0 1px 3px rgba(0,0,2,1)",
                }}
                className="bg-gray-200 !border-[#d1d5db] !text-gray-900 "
              >
                <SelectValue placeholder="Created By" />
              </SelectTrigger>
              <SelectContent
                className="max-h-48 overflow-y-auto bg-gray-100"
                // style={{ backgroundColor: "#fffbe8" }}
              >
                {technicians.map((tech) => (
                  <SelectItem
                    key={tech._id}
                    value={tech.name}
                    className="border-b border-gray-200 hover:bg-gray-300"
                  >
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between items-center mt-8">
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            variant="outline"
          >
            Previous
          </Button>

          <div className="text-sm">
            Instrument {currentIndex + 1} of {selectedInstruments.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex === selectedInstruments.length - 1}
            variant="outline"
          >
            Next
          </Button>
        </div>

        <div className="flex flex-col justify-center items-center mt-8 ">
          <div>
            {!exportData && (
              <Button
                onClick={handleExport}
                style={{
                  backgroundColor: "#2563eb", // Tailwind blue-600
                  color: "#fff",
                  fontWeight: 600,
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  boxShadow: "0 1px 2px rgb(0 0 0 / 0.05)",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease-in-out",
                  border: "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1d4ed8")
                } // hover blue-700
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2563eb")
                }
              >
                Prepare All Calibration Sheets
              </Button>
            )}
          </div>
          <div>
            {startExport && exportData && (
              <PdfDownloadButton
                forms={exportData}
                tolerances={tolerances}
                onAfterDownload={() => {
                  setStartExport(false);
                  setExportData(null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
