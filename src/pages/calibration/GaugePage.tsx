import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

import { Label } from "@/components/ui/label";
import type {
  Instrument,
  Engineer,
  Technician,
  CalibrationFormData,
  Checklist,
} from "@/types";
import { calculateAppliedValues, isOutOfTolerance } from "@/helperFunctions";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTolerance } from "@/CustomHooks/useTolerance";

interface GaugePageProps {
  instrumentData: Instrument;
  tech: string;
  user: string;
  formData: CalibrationFormData;
  onFormChange: (data: CalibrationFormData) => void;
}

export default function GaugePage({
  instrumentData,
  tech,
  user,
  formData,
  onFormChange,
}: GaugePageProps) {

    const { tolerances } = useTolerance();
  
  // Auto-recalculate applied values when range changes
  useEffect(() => {
    if (formData.rangeFrom && formData.rangeTo) {
      const { appliedUpscale, appliedDownscale } = calculateAppliedValues(
        formData.rangeFrom,
        formData.rangeTo
      );

      // Only update if values actually changed
      const upscaleChanged =
        JSON.stringify(appliedUpscale) !==
        JSON.stringify(formData.appliedUpscale);
      const downscaleChanged =
        JSON.stringify(appliedDownscale) !==
        JSON.stringify(formData.appliedDownscale);

      if (upscaleChanged || downscaleChanged) {
        onFormChange({
          ...formData,
          appliedUpscale,
          appliedDownscale,
          // Clear actual values when applied values change
          actualUpscale: Array(5).fill(""),
          actualDownscale: Array(5).fill(""),
        });
      }
    }
  }, [formData.rangeFrom, formData.rangeTo]); // Watch for changes to range fields

  // Helper: update field
  function handleFieldChange<K extends keyof CalibrationFormData>(
    field: K,
    value: CalibrationFormData[K]
  ) {
    onFormChange({ ...formData, [field]: value });
  }

  // Helper: update checklist subfield
  function handleChecklistChange(field: keyof Checklist, value: string) {
    onFormChange({
      ...formData,
      checklist: { ...formData.checklist, [field]: value },
    });
  }

  function toggleAllHealthy() {
    const newValue = !formData.allHealthy;

    // Map of each checklist key to its desired "healthy" value
    const healthyValues: Record<string, string> = {
      exInspection: "Pass",
      sensorStatus: "Good",
      tagInstalled: "Yes",
      cableGlandFixed: "Good",
      earthCableConnected: "Yes",
      terminalsTight: "Good",
      housingCondition: "Good",
      // Add all other relevant checklist fields here if necessary
    };

    const newChecklist = { ...formData.checklist };
    Object.entries(newChecklist).forEach(([key, value]) => {
      newChecklist[key as keyof Checklist] = newValue
        ? healthyValues[key] || ""
        : "";
    });

    onFormChange({
      ...formData,
      allHealthy: newValue,
      checklist: newChecklist,
    });
  }

  // Helper: update array value
  function handleArrayChange(
    type:
      | "appliedUpscale"
      | "actualUpscale"
      | "appliedDownscale"
      | "actualDownscale",
    idx: number,
    value: string
  ) {
    const arr = [...formData[type]];
    arr[idx] = value;
    onFormChange({ ...formData, [type]: arr });
  }

  return (
    <Card className="max-w-5xl mx-auto mt-6 p-6">
      <CardHeader>
        <CardTitle>Gauge Calibration Sheet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gauge Data section */}
        <div className="border border-gray-300 p-4 rounded">
          <h3 className="font-semibold mb-4">Gauge Data</h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="gauge-tag">Tag</Label>
              <Input
                id="gauge-tag"
                value={formData.tag}
                onChange={(e) => handleFieldChange("tag", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gauge-range-from">Range From</Label>
              <Input
                id="gauge-range-from"
                value={formData.rangeFrom}
                onChange={(e) => handleFieldChange("rangeFrom", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gauge-range-to">Range To</Label>
              <Input
                id="gauge-range-to"
                value={formData.rangeTo}
                onChange={(e) => handleFieldChange("rangeTo", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gauge-unit">Unit</Label>
              <Input
                id="gauge-unit"
                value={formData.unit}
                onChange={(e) => handleFieldChange("unit", e.target.value)}
              />
            </div>
          </div>

          {/* Gauge Type */}
          <div className="border border-gray-300 p-3 mb-4 rounded">
            <Label className="block mb-2 font-semibold">Gauge Type</Label>
            <RadioGroup
              value={formData.gaugeType || ""}
              onValueChange={(value) => handleFieldChange("gaugeType", value)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Pressure" id="gauge-pressure" />
                <Label htmlFor="gauge-pressure">Pressure</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Temperature" id="gauge-temperature" />
                <Label htmlFor="gauge-temperature">Temperature</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Level" id="gauge-level" />
                <Label htmlFor="gauge-level">Level</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Flow" id="gauge-flow" />
                <Label htmlFor="gauge-flow">Flow</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Medium */}
          <div className="border border-gray-300 p-3 rounded">
            <Label className="block mb-2 font-semibold">Medium</Label>
            <RadioGroup
              value={formData.medium || ""}
              onValueChange={(value) => handleFieldChange("medium", value)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Liquid" id="medium-liquid" />
                <Label htmlFor="medium-liquid">Liquid</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Gas" id="medium-gas" />
                <Label htmlFor="medium-gas">Gas</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Test Results */}
        <div>
          <div className="font-semibold mb-2">Test Results</div>
          <table className="w-full table-fixed border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-1 w-28" colSpan={2}>
                  Upscale
                </th>
                <th className="border border-gray-300 p-1 w-28" colSpan={2}>
                  Downscale
                </th>
                <th className="border border-gray-300 p-1 w-24">Unit</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-1 font-semibold">
                  Applied Value
                </th>
                <th className="border border-gray-300 p-1 font-semibold">
                  Actual Value
                </th>
                <th className="border border-gray-300 p-1 font-semibold">
                  Applied Value
                </th>
                <th className="border border-gray-300 p-1 font-semibold">
                  Actual Value
                </th>
                <th className="border border-gray-300 p-1 font-semibold">
                  Unit
                </th>
              </tr>
            </thead>
            <tbody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 p-1">
                      <Input
                        value={formData.appliedUpscale[i]}
                        readOnly
                        className="w-full"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <Input
                        value={formData.actualUpscale[i]}
                        onChange={(e) =>
                          handleArrayChange("actualUpscale", i, e.target.value)
                        }
                        style={
                          isOutOfTolerance(
                            formData.appliedUpscale[i],
                            formData.actualUpscale[i],
                            tolerances!.gaugeTolerance,
                            Math.abs((Number(formData.rangeTo)-Number(formData.rangeFrom)))
                          )
                            ? { color: "red", fontWeight: "bold" }
                            : {}
                        }
                        className="w-full"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <Input
                        value={formData.appliedDownscale[i]}
                        readOnly
                        className="w-full"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <Input
                        value={formData.actualDownscale[i]}
                        onChange={(e) =>
                          handleArrayChange(
                            "actualDownscale",
                            i,
                            e.target.value
                          )
                        }
                         style={
                          isOutOfTolerance(
                            formData.appliedDownscale[i],
                            formData.actualDownscale[i],
                            tolerances!.gaugeTolerance,
                            Math.abs((Number(formData.rangeTo)-Number(formData.rangeFrom)))
                          )
                            ? { color: "red", fontWeight: "bold" }
                            : {}
                        }
                        className="w-full"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      {formData.unit}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Inspection Checklist */}
        <div>
          <div className="font-semibold mb-2">Inspection Checklist</div>
          <div className="grid grid-cols-1 gap-4">
            {/* Visual Inspection */}
            <div className="border border-gray-300 p-2">
              <Label className="block font-semibold mb-1">
                Visual Inspection
              </Label>
              <RadioGroup
                value={formData.checklist.exInspection}
                onValueChange={(val) =>
                  handleChecklistChange("exInspection", val)
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Pass" id="visual-pass" />
                  <Label htmlFor="visual-pass">Pass</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Fail" id="visual-fail" />
                  <Label htmlFor="visual-fail">Fail</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Sensor Element Status */}
            <div className="border border-gray-300 p-2">
              <Label className="block font-semibold mb-1">
                Sensor Element Status
              </Label>
              <RadioGroup
                value={formData.checklist.sensorStatus}
                onValueChange={(val) =>
                  handleChecklistChange("sensorStatus", val)
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Good" id="sensor-good" />
                  <Label htmlFor="sensor-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="sensor-bad" />
                  <Label htmlFor="sensor-bad">Bad</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Inst. Tag Installed */}
            <div className="border border-gray-300 p-2">
              <Label className="block font-semibold mb-1">
                Inst. Tag Installed
              </Label>
              <RadioGroup
                value={formData.checklist.tagInstalled}
                onValueChange={(val) =>
                  handleChecklistChange("tagInstalled", val)
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="tag-yes" />
                  <Label htmlFor="tag-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="tag-no" />
                  <Label htmlFor="tag-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Gauge Glass Condition */}
            <div className="border border-gray-300 p-2">
              <Label className="block font-semibold mb-1">
                Gauge Glass Condition
              </Label>
              <RadioGroup
                value={formData.checklist.cableGlandFixed}
                onValueChange={(val) =>
                  handleChecklistChange("cableGlandFixed", val)
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Good" id="glass-good" />
                  <Label htmlFor="glass-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="glass-bad" />
                  <Label htmlFor="glass-bad">Bad</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Filling With Glycerine */}
            <div className="border border-gray-300 p-2">
              <Label className="block font-semibold mb-1">
                Filling With Glycerine
              </Label>
              <RadioGroup
                value={formData.checklist.cablePlugCertified}
                onValueChange={(val) =>
                  handleChecklistChange("cablePlugCertified", val)
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="glycerine-yes" />
                  <Label htmlFor="glycerine-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="glycerine-no" />
                  <Label htmlFor="glycerine-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Pointer Is Moving Smoothly */}
            <div className="border border-gray-300 p-2">
              <Label className="block font-semibold mb-1">
                Pointer Is Moving Smoothly
              </Label>
              <RadioGroup
                value={formData.checklist.earthCableConnected}
                onValueChange={(val) =>
                  handleChecklistChange("earthCableConnected", val)
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="pointer-yes" />
                  <Label htmlFor="pointer-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="pointer-no" />
                  <Label htmlFor="pointer-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Isolation Manifold */}
            <div className="border border-gray-300 p-2">
              <Label className="block font-semibold mb-1">
                Isolation Manifold
              </Label>
              <RadioGroup
                value={formData.checklist.terminalsTight}
                onValueChange={(val) =>
                  handleChecklistChange("terminalsTight", val)
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Good" id="manifold-good" />
                  <Label htmlFor="manifold-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="manifold-bad" />
                  <Label htmlFor="manifold-bad">Bad</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Device Housing Condition */}
            <div className="border border-gray-300 p-2">
              <Label className="block font-semibold mb-1">
                Device Housing Condition
              </Label>
              <RadioGroup
                value={formData.checklist.housingCondition}
                onValueChange={(val) =>
                  handleChecklistChange("housingCondition", val)
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Good" id="housing-good" />
                  <Label htmlFor="housing-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="housing-bad" />
                  <Label htmlFor="housing-bad">Bad</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Sensor Type - Measuring System */}
            <div className="border border-gray-300 p-2">
              <Label className="block font-semibold mb-2">
                Sensor Type - Measuring System
              </Label>
              <div className="space-y-2">
                <RadioGroup
                  value={formData.sensorType || ""}
                  onValueChange={(value) =>
                    handleFieldChange("sensorType", value)
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="RTD" id="sensor-rtd" />
                    <Label htmlFor="sensor-rtd">RTD</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="TC" id="sensor-tc" />
                    <Label htmlFor="sensor-tc">TC</Label>
                  </div>
                </RadioGroup>

                <RadioGroup
                  value={formData.measuringSystem || ""}
                  onValueChange={(value) =>
                    handleFieldChange("measuringSystem", value)
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Capsule" id="system-capsule" />
                    <Label htmlFor="system-capsule">Capsule</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Bourdon Tube" id="system-bourdon" />
                    <Label htmlFor="system-bourdon">Bourdon Tube</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Other" id="system-other" />
                    <Label htmlFor="system-other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
        {/* Controls */}
        <div className="flex items-center space-x-6">
          <Button
            variant={formData.allHealthy ? "default" : "outline"}
            onClick={toggleAllHealthy}
            className="select-none"
            aria-pressed={formData.allHealthy}
          >
            {formData.allHealthy ? "All Healthy (Checked)" : "Mark All Healthy"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const clearedChecklist: Checklist = {
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
              onFormChange({
                ...formData,
                checklist: clearedChecklist,
                allHealthy: false,
              });
            }}
          >
            Clear Selection
          </Button>
        </div>
        {/* Comments */}
        <div>
          <Label htmlFor="gauge-comments">Comments</Label>
          <Textarea
            id="gauge-comments"
            value={formData.comments}
            onChange={(e) => handleFieldChange("comments", e.target.value)}
            className="w-full"
            rows={4}
          />
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 items-end">
          <div className="select-none font-semibold">
            Created By: <span className="font-normal">{tech}</span>
          </div>
          <div className="select-none font-semibold">
            Verified By: <span className="font-normal">{user}</span>
          </div>

          <div className="text-right font-semibold">{formData.date}</div>
        </div>
      </CardContent>
    </Card>
  );
}
