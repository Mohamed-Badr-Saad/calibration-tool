// src/pages/calibration/PCVPage.tsx

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Instrument, CalibrationFormData, Checklist } from "@/types";

interface PCVPageProps {
  instrumentData: Instrument;
  tech: string;
  user: string;
  formData: CalibrationFormData;
  onFormChange: (data: CalibrationFormData) => void;
}

export default function PCVPage({
  instrumentData,
  tech,
  user,
  formData,
  onFormChange,
}: PCVPageProps) {
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
      sensorStatus: "Pass",
      tagInstalled: "Yes",
      cableTagInstalled: "No",
      cableGlandFixed: "No",
      cablePlugCertified: "Yes",
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
        <CardTitle>PCV Calibration Sheet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PCV Data section */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="pcv-tag">Tag</Label>
            <Input
              id="pcv-tag"
              value={formData.tag}
              onChange={(e) => handleFieldChange("tag", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pcv-size">Size</Label>
            <div className="flex">
              <Input
                id="pcv-size"
                value={formData.size || ""}
                onChange={(e) => handleFieldChange("size", e.target.value)}
                className="rounded-r-none"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                Inch
              </span>
            </div>
          </div>
          <div>
            <Label htmlFor="pcv-setpoint">Set Point</Label>
            <Input
              id="pcv-setpoint"
              value={formData.setPoint || ""}
              onChange={(e) => handleFieldChange("setPoint", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pcv-unit">Unit</Label>
            <Input
              id="pcv-unit"
              value={formData.setPointUnit || ""}
              onChange={(e) =>
                handleFieldChange("setPointUnit", e.target.value)
              }
            />
          </div>
        </div>

        {/* Regulating Target */}
        <div className="border border-gray-300 p-3 rounded">
          <Label className="block mb-2 font-semibold">Regulating Target</Label>
          <RadioGroup
            value={formData.regulatingTarget || ""}
            onValueChange={(value) =>
              handleFieldChange("regulatingTarget", value)
            }
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Upstream" id="pcv-upstream" />
              <Label htmlFor="pcv-upstream">Upstream</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Downstream" id="pcv-downstream" />
              <Label htmlFor="pcv-downstream">Downstream</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Valve Type */}
        <div className="border border-gray-300 p-3 rounded">
          <Label className="block mb-2 font-semibold">Valve Type</Label>
          <RadioGroup
            value={formData.pcvValveType || ""}
            onValueChange={(value) => handleFieldChange("pcvValveType", value)}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Direct Acting" id="pcv-direct" />
              <Label htmlFor="pcv-direct">Direct Acting</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Pilot Operated" id="pcv-pilot" />
              <Label htmlFor="pcv-pilot">Pilot Operated</Label>
            </div>
          </RadioGroup>
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
                  <RadioGroupItem value="Pass" id="pcv-visual-pass" />
                  <Label htmlFor="pcv-visual-pass">Pass</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Fail" id="pcv-visual-fail" />
                  <Label htmlFor="pcv-visual-fail">Fail</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Function Test Result */}
            <RadioGroup
              value={formData.checklist.sensorStatus}
              onValueChange={(val) =>
                handleChecklistChange("sensorStatus", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Function Test Result
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Pass" id="pcv-function-pass" />
                  <Label htmlFor="pcv-function-pass">Pass</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Fail" id="pcv-function-fail" />
                  <Label htmlFor="pcv-function-fail">Fail</Label>
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
                  <RadioGroupItem value="Yes" id="pcv-tag-yes" />
                  <Label htmlFor="pcv-tag-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="pcv-tag-no" />
                  <Label htmlFor="pcv-tag-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Is There Any External */}
            <RadioGroup
              value={formData.checklist.cableTagInstalled}
              onValueChange={(val) =>
                handleChecklistChange("cableTagInstalled", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Is There Any External Leakage
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="pcv-external-yes" />
                  <Label htmlFor="pcv-external-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="pcv-external-no" />
                  <Label htmlFor="pcv-external-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Is There Any Internal Leakage */}
            <RadioGroup
              value={formData.checklist.cableGlandFixed}
              onValueChange={(val) =>
                handleChecklistChange("cableGlandFixed", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Is There Any Internal Leakage
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="pcv-internal-yes" />
                  <Label htmlFor="pcv-internal-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="pcv-internal-no" />
                  <Label htmlFor="pcv-internal-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Slightly Change SP,Response Is */}
            <RadioGroup
              value={formData.checklist.cablePlugCertified}
              onValueChange={(val) =>
                handleChecklistChange("cablePlugCertified", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Slightly Change SP,Response Is
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="pcv-response-yes" />
                  <Label htmlFor="pcv-response-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="pcv-response-no" />
                  <Label htmlFor="pcv-response-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Returned Back To Original SP */}
            <RadioGroup
              value={formData.checklist.earthCableConnected}
              onValueChange={(val) =>
                handleChecklistChange("earthCableConnected", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Returned Back To Original SP
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="pcv-return-yes" />
                  <Label htmlFor="pcv-return-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="pcv-return-no" />
                  <Label htmlFor="pcv-return-no">No</Label>
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
                  <RadioGroupItem value="Good" id="pcv-housing-good" />
                  <Label htmlFor="pcv-housing-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="pcv-housing-bad" />
                  <Label htmlFor="pcv-housing-bad">Bad</Label>
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
          <Label htmlFor="pcv-comments">Comments</Label>
          <Textarea
            id="pcv-comments"
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
