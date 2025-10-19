import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Instrument, CalibrationFormData, Checklist } from "@/types";
import { calculateAppliedValues, isOutOfTolerance } from "@/helperFunctions";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTolerance } from "@/CustomHooks/useTolerance";

interface TransmitterPageProps {
  instrumentData: Instrument;
  tech: string;
  user: string;
  formData: CalibrationFormData;
  onFormChange: (data: CalibrationFormData) => void;
}

export default function TransmitterPage({
  instrumentData,
  tech,
  user,
  formData,
  onFormChange,
}: TransmitterPageProps) {
  const { tolerances } = useTolerance();

  // Auto-recalculate applied values when range changes
  useEffect(() => {
    if (formData.rangeFrom && formData.rangeTo) {
      const { appliedUpscale, appliedDownscale } = calculateAppliedValues(
        formData.rangeFrom,
        formData.rangeTo
      );

      // Only update if values actually changed to avoid infinite loops
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
    // Update all checklist fields accordingly (use "Yes" if checked, "" if unchecked)
    Object.entries(formData.checklist).map(([key, value]) => {
      formData.checklist[key as keyof Checklist] = newValue ? "Pass" : "";
      return null;
    });
    const newChecklist = { ...formData.checklist };

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
        <CardTitle>Transmitter Calibration Sheet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transmitter Data section */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="tag">Tag</Label>
            <Input
              id="tag"
              value={formData.tag}
              onChange={(e) => handleFieldChange("tag", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="range-from">Range From</Label>
            <Input
              id="range-from"
              value={formData.rangeFrom}
              onChange={(e) => handleFieldChange("rangeFrom", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="range-to">Range To</Label>
            <Input
              id="range-to"
              value={formData.rangeTo}
              onChange={(e) => handleFieldChange("rangeTo", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => handleFieldChange("unit", e.target.value)}
            />
          </div>
        </div>

        {/* Protocol Radio Group */}
        <div>
          <Label className="block mb-1 font-semibold">Protocol</Label>
          <RadioGroup
            value={formData.protocol}
            onValueChange={(value) => handleFieldChange("protocol", value)}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="FF" id="protocol-ff" />
              <Label htmlFor="protocol-ff">FF</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="HART" id="protocol-hart" />
              <Label htmlFor="protocol-hart">HART</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Analog" id="protocol-analog" />
              <Label htmlFor="protocol-analog">Analog</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Test Results: Upscale and Downscale tables */}
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
                            tolerances!.transmitterTolerance,
                            Math.abs(
                              Number(formData.rangeTo) -
                                Number(formData.rangeFrom)
                            )
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
                            tolerances!.transmitterTolerance,
                            Math.abs(
                              Number(formData.rangeTo) -
                                Number(formData.rangeFrom)
                            )
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

        {/* Checklist */}
        <div>
          <div className="font-semibold mb-2">Checklist</div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(formData.checklist).map(([key, value]) => (
              <RadioGroup
                key={key}
                value={value}
                onValueChange={(val) =>
                  handleChecklistChange(key as keyof Checklist, val)
                }
                className="mb-4"
              >
                <Label className="block font-semibold capitalize mb-1">
                  {key.replace(/([A-Z])/g, " $1")}
                </Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Pass" id={`${key}-pass`} />
                    <Label htmlFor={`${key}-pass`}>Pass</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Fail" id={`${key}-fail`} />
                    <Label htmlFor={`${key}-fail`}>Fail</Label>
                  </div>
                </div>
              </RadioGroup>
            ))}
          </div>
        </div>

        {/* Flow TX Controls */}
        <div>
          <Label className="block mb-1 font-semibold">Flow TX</Label>
          <RadioGroup
            value={formData.flowTx}
            onValueChange={(val) => handleFieldChange("flowTx", val)}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Linear" id="flow-linear" />
              <Label htmlFor="flow-linear">Linear</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Square Root" id="flow-square-root" />
              <Label htmlFor="flow-square-root">Square Root</Label>
            </div>
          </RadioGroup>
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
          <Label htmlFor="comments">Comments</Label>
          <Textarea
            id="comments"
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
