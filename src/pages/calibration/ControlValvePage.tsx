import { useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Instrument, CalibrationFormData, Checklist } from "@/types";
import { useTolerance } from "@/CustomHooks/useTolerance";
import { isOutOfTolerance } from "@/helperFunctions";

// Helper function for calculating applied values (0-100% for control valves)
function calculateAppliedValues(): {
  appliedUpscale: string[];
  appliedDownscale: string[];
} {
  const upscale = [0, 25, 50, 75, 100].map((val) => val.toString());
  const downscale = [100, 75, 50, 25, 0].map((val) => val.toString());

  return {
    appliedUpscale: upscale,
    appliedDownscale: downscale,
  };
}

interface ControlValvePageProps {
  instrumentData: Instrument;
  tech: string;
  user: string;
  formData: CalibrationFormData;
  onFormChange: (data: CalibrationFormData) => void;
}

export default function ControlValvePage({
  instrumentData,
  tech,
  user,
  formData,
  onFormChange,
}: ControlValvePageProps) {
  const { tolerances } = useTolerance();

  // Initialize applied values for control valve (0-100%)
  useEffect(() => {
    const { appliedUpscale, appliedDownscale } = calculateAppliedValues();

    // Only update if values are empty or different
    const upscaleEmpty = formData.appliedUpscale.every((val) => val === "");
    const downscaleEmpty = formData.appliedDownscale.every((val) => val === "");

    if (upscaleEmpty || downscaleEmpty) {
      onFormChange({
        ...formData,
        appliedUpscale,
        appliedDownscale,
        actualUpscale:
          formData.actualUpscale.length === 5
            ? formData.actualUpscale
            : Array(5).fill(""),
        actualDownscale:
          formData.actualDownscale.length === 5
            ? formData.actualDownscale
            : Array(5).fill(""),
      });
    }
  }, [instrumentData]);

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

  function toggleAllHealthy() {
    const newValue = !formData.allHealthy;

    // Map of each checklist key to its desired "healthy" value
    const healthyValues: Record<string, string> = {
      exInspection: "Pass",
      sensorStatus: "Yes",
      tagInstalled: "Yes",
      cableTagInstalled: "Yes",
      cableGlandFixed: "Yes",
      cablePlugCertified: "No",
      earthCableConnected: "Yes",
      terminalsTight: "Good",
      cableScreenNotConnected: "Pass",
      dcsReading: "Good",
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

  return (
    <Card className="max-w-5xl mx-auto mt-6 p-6">
      <CardHeader>
        <CardTitle>Control Valve Calibration Sheet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Control Valve Data section */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="cv-tag">Tag</Label>
            <Input
              id="cv-tag"
              value={formData.tag}
              onChange={(e) => handleFieldChange("tag", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cv-size">Size</Label>
            <div className="flex">
              <Input
                id="cv-size"
                value={formData.size || ""}
                onChange={(e) => handleFieldChange("size", e.target.value)}
                className="rounded-r-none"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                Inch
              </span>
            </div>
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
              <RadioGroupItem value="FF" id="cv-protocol-ff" />
              <Label htmlFor="cv-protocol-ff">FF</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="HART" id="cv-protocol-hart" />
              <Label htmlFor="cv-protocol-hart">HART</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Analog" id="cv-protocol-analog" />
              <Label htmlFor="cv-protocol-analog">Analog</Label>
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
                            tolerances!.controlValveTolerance,
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
                            tolerances!.controlValveTolerance,
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
                    <td className="border border-gray-300 p-1">%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Checklist */}
        <div>
          <div className="font-semibold mb-2">Checklist</div>
          <div className="grid grid-cols-2 gap-4">
            {/* Visual Inspection */}
            <RadioGroup
              value={formData.checklist.exInspection}
              onValueChange={(val) =>
                handleChecklistChange("exInspection", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Visual Inspection
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Pass" id="cv-visual-pass" />
                  <Label htmlFor="cv-visual-pass">Pass</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Fail" id="cv-visual-fail" />
                  <Label htmlFor="cv-visual-fail">Fail</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Pneumatic Supply Press. Is */}
            <RadioGroup
              value={formData.checklist.sensorStatus}
              onValueChange={(val) =>
                handleChecklistChange("sensorStatus", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Pneumatic Supply Press. Is
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="cv-pneumatic-yes" />
                  <Label htmlFor="cv-pneumatic-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="cv-pneumatic-no" />
                  <Label htmlFor="cv-pneumatic-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Inst. Tag Installed */}
            <RadioGroup
              value={formData.checklist.tagInstalled}
              onValueChange={(val) =>
                handleChecklistChange("tagInstalled", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Inst. Tag Installed
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="cv-tag-yes" />
                  <Label htmlFor="cv-tag-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="cv-tag-no" />
                  <Label htmlFor="cv-tag-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Cable Tag Installed Correctly */}
            <RadioGroup
              value={formData.checklist.cableTagInstalled}
              onValueChange={(val) =>
                handleChecklistChange("cableTagInstalled", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Cable Tag Installed Correctly
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="cv-cable-tag-yes" />
                  <Label htmlFor="cv-cable-tag-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="cv-cable-tag-no" />
                  <Label htmlFor="cv-cable-tag-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Cable Gland Is Fixed Well */}
            <RadioGroup
              value={formData.checklist.cableGlandFixed}
              onValueChange={(val) =>
                handleChecklistChange("cableGlandFixed", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Cable Gland Is Fixed Well
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="cv-gland-yes" />
                  <Label htmlFor="cv-gland-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="cv-gland-no" />
                  <Label htmlFor="cv-gland-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Is There A Hunting Problem */}
            <RadioGroup
              value={formData.checklist.cablePlugCertified}
              onValueChange={(val) =>
                handleChecklistChange("cablePlugCertified", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Is There A Hunting Problem
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="cv-hunting-yes" />
                  <Label htmlFor="cv-hunting-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="cv-hunting-no" />
                  <Label htmlFor="cv-hunting-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Earth Cable Is Connected */}
            <RadioGroup
              value={formData.checklist.earthCableConnected}
              onValueChange={(val) =>
                handleChecklistChange("earthCableConnected", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Earth Cable Is Connected
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="cv-earth-yes" />
                  <Label htmlFor="cv-earth-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="cv-earth-no" />
                  <Label htmlFor="cv-earth-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Positioner Status */}
            <RadioGroup
              value={formData.checklist.terminalsTight}
              onValueChange={(val) =>
                handleChecklistChange("terminalsTight", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Positioner Status
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Good" id="cv-positioner-good" />
                  <Label htmlFor="cv-positioner-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="cv-positioner-bad" />
                  <Label htmlFor="cv-positioner-bad">Bad</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Function Test Result */}
            <RadioGroup
              value={formData.checklist.cableScreenNotConnected}
              onValueChange={(val) =>
                handleChecklistChange("cableScreenNotConnected", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Function Test Result
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Pass" id="cv-function-pass" />
                  <Label htmlFor="cv-function-pass">Pass</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Fail" id="cv-function-fail" />
                  <Label htmlFor="cv-function-fail">Fail</Label>
                </div>
              </div>
            </RadioGroup>

            {/* DCS Reading */}
            <RadioGroup
              value={formData.checklist.dcsReading}
              onValueChange={(val) => handleChecklistChange("dcsReading", val)}
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                DCS Reading
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Good" id="cv-dcs-good" />
                  <Label htmlFor="cv-dcs-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="cv-dcs-bad" />
                  <Label htmlFor="cv-dcs-bad">Bad</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Device Housing Condition */}
            <RadioGroup
              value={formData.checklist.housingCondition}
              onValueChange={(val) =>
                handleChecklistChange("housingCondition", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Device Housing Condition
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Good" id="cv-housing-good" />
                  <Label htmlFor="cv-housing-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="cv-housing-bad" />
                  <Label htmlFor="cv-housing-bad">Bad</Label>
                </div>
              </div>
            </RadioGroup>
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
          <Label htmlFor="cv-comments">Comments</Label>
          <Textarea
            id="cv-comments"
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
