import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Instrument, CalibrationFormData, Checklist } from "@/types";
import { useTolerance } from "@/CustomHooks/useTolerance";
import { isOutOfTolerance, isValveTimeOutOfTolerance } from "@/helperFunctions";
import { useState } from "react";

interface OnOffValvePageProps {
  instrumentData: Instrument;
  tech: string;
  user: string;
  formData: CalibrationFormData;
  onFormChange: (data: CalibrationFormData) => void;
}

export default function OnOffValvePage({
  instrumentData,
  tech,
  user,
  formData,
  onFormChange,
}: OnOffValvePageProps) {
  const { tolerances } = useTolerance();
  const [valveType, setValveType] = useState<string>("");


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
      sensorStatus: "Yes",
      tagInstalled: "Yes",
      cableTagInstalled: "Yes",
      cableGlandFixed: "Yes",
      cablePlugCertified: "Good",
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
        <CardTitle>On/Off Valve Calibration Sheet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Valve Data section */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="ov-tag">Tag</Label>
            <Input
              id="ov-tag"
              value={formData.tag}
              onChange={(e) => handleFieldChange("tag", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ov-size">Size</Label>
            <div className="flex">
              <Input
                id="ov-size"
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

        {/* Valve Type Radio Group */}
        <div>
          <Label className="block mb-1 font-semibold">Valve Type</Label>
          <RadioGroup
            value={formData.valveType || ""}
            onValueChange={(value) => handleFieldChange("valveType", value)}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="Sequence"
                id="ov-sequence"
                onClick={() => setValveType("Sequence")}
              />
              <Label
                htmlFor="ov-sequence"
                onClick={() => setValveType("Sequence")}
              >
                Sequence
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="SDV"
                id="ov-sdv"
                onClick={() => setValveType("SDV")}
              />
              <Label htmlFor="ov-sdv" onClick={() => setValveType("SDV")}>
                SDV
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="BDV"
                id="ov-bdv"
                onClick={() => setValveType("BDV")}
              />
              <Label htmlFor="ov-bdv" onClick={() => setValveType("BDV")}>
                BDV
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Test Results */}
        <div>
          <div className="font-semibold mb-2">Test Results</div>
          <table className="w-full table-fixed border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 w-32 font-semibold">
                  Order
                </th>
                <th className="border border-gray-300 p-2 font-semibold">
                  Open
                </th>
                <th className="border border-gray-300 p-2 font-semibold">
                  Close
                </th>
                <th className="border border-gray-300 p-2 w-24 font-semibold">
                  Unit
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">
                  Feedback Value
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    value={formData.feedbackValueOpen || ""}
                    onChange={(e) =>
                      handleFieldChange("feedbackValueOpen", e.target.value)
                    }
                    style={
                      isOutOfTolerance(
                        "100",
                        formData.feedbackValueOpen,
                        tolerances!.onOffValveFeedbackTolerance,
                        100
                      )
                        ? { color: "red", fontWeight: "bold" }
                        : {}
                    }
                    className="w-full"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    value={formData.feedbackValueClose || ""}
                    onChange={(e) =>
                      handleFieldChange("feedbackValueClose", e.target.value)
                    }
                    style={
                      isOutOfTolerance(
                        "0",
                        formData.feedbackValueClose,
                        tolerances!.onOffValveFeedbackTolerance,
                        100
                      )
                        ? { color: "red", fontWeight: "bold" }
                        : {}
                    }
                    className="w-full"
                  />
                </td>
                <td className="border border-gray-300 p-2 text-center">%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">
                  Time
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    value={formData.timeOpen || ""}
                    onChange={(e) =>
                      handleFieldChange("timeOpen", e.target.value)
                    }
                    style={
                      isValveTimeOutOfTolerance(
                        Number(formData.timeOpen),
                        Number(tolerances?.onOffValveTimeTolerance),
                        Number(formData.size),
                        valveType
                      ) &&
                      (valveType.toUpperCase() === "BDV" || valveType.toUpperCase() === "SEQUENCE")
                        ? { color: "red", fontWeight: "bold" }
                        : {}
                    }
                    className="w-full"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    value={formData.timeClose || ""}
                    onChange={(e) =>
                      handleFieldChange("timeClose", e.target.value)
                    }
                    style={
                      isValveTimeOutOfTolerance(
                        Number(formData.timeClose),
                        Number(tolerances?.onOffValveTimeTolerance),
                        Number(formData.size),
                        valveType
                      ) &&
                      (valveType.toUpperCase() === "SDV" || valveType.toUpperCase() === "SEQUENCE")
                        ? { color: "red", fontWeight: "bold" }
                        : {}
                    }
                    className="w-full"
                  />
                </td>
                <td className="border border-gray-300 p-2 text-center">SEC</td>
              </tr>
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
                  <RadioGroupItem value="Pass" id="ov-visual-pass" />
                  <Label htmlFor="ov-visual-pass">Pass</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Fail" id="ov-visual-fail" />
                  <Label htmlFor="ov-visual-fail">Fail</Label>
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
                  <RadioGroupItem value="Yes" id="ov-pneumatic-yes" />
                  <Label htmlFor="ov-pneumatic-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="ov-pneumatic-no" />
                  <Label htmlFor="ov-pneumatic-no">No</Label>
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
                  <RadioGroupItem value="Yes" id="ov-tag-yes" />
                  <Label htmlFor="ov-tag-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="ov-tag-no" />
                  <Label htmlFor="ov-tag-no">No</Label>
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
                  <RadioGroupItem value="Yes" id="ov-cable-tag-yes" />
                  <Label htmlFor="ov-cable-tag-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="ov-cable-tag-no" />
                  <Label htmlFor="ov-cable-tag-no">No</Label>
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
                  <RadioGroupItem value="Yes" id="ov-gland-yes" />
                  <Label htmlFor="ov-gland-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="ov-gland-no" />
                  <Label htmlFor="ov-gland-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* SOV And Other Components */}
            <RadioGroup
              value={formData.checklist.cablePlugCertified}
              onValueChange={(val) =>
                handleChecklistChange("cablePlugCertified", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                SOV And Other Components
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Good" id="ov-sov-good" />
                  <Label htmlFor="ov-sov-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="ov-sov-bad" />
                  <Label htmlFor="ov-sov-bad">Bad</Label>
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
                  <RadioGroupItem value="Yes" id="ov-earth-yes" />
                  <Label htmlFor="ov-earth-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="ov-earth-no" />
                  <Label htmlFor="ov-earth-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Position Transmitter */}
            <RadioGroup
              value={formData.checklist.terminalsTight}
              onValueChange={(val) =>
                handleChecklistChange("terminalsTight", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Position Transmitter
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Good" id="ov-position-good" />
                  <Label htmlFor="ov-position-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="ov-position-bad" />
                  <Label htmlFor="ov-position-bad">Bad</Label>
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
                  <RadioGroupItem value="Pass" id="ov-function-pass" />
                  <Label htmlFor="ov-function-pass">Pass</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Fail" id="ov-function-fail" />
                  <Label htmlFor="ov-function-fail">Fail</Label>
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
                  <RadioGroupItem value="Good" id="ov-dcs-good" />
                  <Label htmlFor="ov-dcs-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="ov-dcs-bad" />
                  <Label htmlFor="ov-dcs-bad">Bad</Label>
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
                  <RadioGroupItem value="Good" id="ov-housing-good" />
                  <Label htmlFor="ov-housing-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="ov-housing-bad" />
                  <Label htmlFor="ov-housing-bad">Bad</Label>
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
          <Label htmlFor="ov-comments">Comments</Label>
          <Textarea
            id="ov-comments"
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
