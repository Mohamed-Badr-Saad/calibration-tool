import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import type { Instrument, CalibrationFormData, Checklist } from "@/types";
import { useTolerance } from "@/CustomHooks/useTolerance";
import { isOutOfTolerance } from "@/helperFunctions";

interface SwitchPageProps {
  instrumentData: Instrument;
  tech: string;
  user: string;
  formData: CalibrationFormData;
  onFormChange: (data: CalibrationFormData) => void;
}

export default function SwitchPage({
  instrumentData,
  tech,
  user,
  formData,
  onFormChange,
}: SwitchPageProps) {
  const { tolerances } = useTolerance();
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
    const ChecklistFields1 = [
      "tagInstalled",
      "cableTagInstalled",
      "cableGlandFixed",
      "cablePlugCertified",
      "earthCableConnected",
      "terminalsTight",
    ] as (keyof Checklist)[];
    const ChecklistFields2 = [
      "dcsReading",
      "housingCondition",
    ] as (keyof Checklist)[];
    const ChecklistFields3 = [
      "exInspection",
      "cableScreenNotConnected",
    ] as (keyof Checklist)[];
    const newChecklist = { ...formData.checklist };
    ChecklistFields1.forEach((field) => {
      newChecklist[field] = newValue ? "Yes" : "";
    });
    ChecklistFields2.forEach((field) => {
      newChecklist[field] = newValue ? "Good" : "";
    });
    ChecklistFields3.forEach((field) => {
      newChecklist[field] = newValue ? "Pass" : "";
    });

    onFormChange({
      ...formData,
      allHealthy: newValue,
      checklist: newChecklist,
    });
  }

  return (
    <Card className=" mx-auto mt-6 p-6">
      <CardHeader>
        <CardTitle>Switch Calibration Sheet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Switch Data section */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="sw-tag">Tag</Label>
            <Input
              id="sw-tag"
              value={formData.tag}
              onChange={(e) => handleFieldChange("tag", e.target.value)}
            />
          </div>
        </div>

        {/* Switch Type Radio Group */}
        <div>
          <Label className="block mb-1 font-semibold">Switch Type</Label>
          <RadioGroup
            value={formData.switchType || ""}
            onValueChange={(value) => handleFieldChange("switchType", value)}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Vibration" id="sw-vibration" />
              <Label htmlFor="sw-vibration">Vibration</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Pressure" id="sw-pressure" />
              <Label htmlFor="sw-pressure">Pressure</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Flow" id="sw-flow" />
              <Label htmlFor="sw-flow">Flow</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Level" id="sw-level" />
              <Label htmlFor="sw-level">Level</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Temperature" id="sw-temperature" />
              <Label htmlFor="sw-temperature">Temperature</Label>
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
                  Status
                </th>
                <th className="border border-gray-300 p-2 font-semibold">
                  Active
                </th>
                <th className="border border-gray-300 p-2 font-semibold">
                  Healthy
                </th>
                <th className="border border-gray-300 p-2 w-24 font-semibold">
                  Unit
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">
                  Test Result
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    value={formData.testResultActive || ""}
                    onChange={(e) =>
                      handleFieldChange("testResultActive", e.target.value)
                    }
                    style={
                      isOutOfTolerance(
                        formData.setPointActive,
                        formData.testResultActive,
                        tolerances!.switchTolerance,
                        Math.abs(
                          Number(formData.setPointActive) -
                            Number(formData.setPointHealthy)
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
                    value={formData.testResultHealthy || ""}
                    onChange={(e) =>
                      handleFieldChange("testResultHealthy", e.target.value)
                    }
                    style={
                      isOutOfTolerance(
                        formData.setPointHealthy,
                        formData.testResultHealthy,
                        tolerances!.switchTolerance,
                        Math.abs(
                          Number(formData.setPointActive) -
                            Number(formData.setPointHealthy)
                        )
                      )
                        ? { color: "red", fontWeight: "bold" }
                        : {}
                    }
                    className="w-full"
                  />
                </td>
                <td className="border border-gray-300 p-2 text-center">{formData.unit}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">
                  Set Point
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    value={formData.setPointActive || ""}
                    onChange={(e) =>
                      handleFieldChange("setPointActive", e.target.value)
                    }
                    className="w-full"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <Input
                    value={formData.setPointHealthy || ""}
                    onChange={(e) =>
                      handleFieldChange("setPointHealthy", e.target.value)
                    }
                    className="w-full"
                  />
                </td>
                <td className="border border-gray-300 p-2 text-center">{formData.unit}</td>
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
                  <RadioGroupItem value="Pass" id="sw-visual-pass" />
                  <Label htmlFor="sw-visual-pass">Pass</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Fail" id="sw-visual-fail" />
                  <Label htmlFor="sw-visual-fail">Fail</Label>
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
                  <RadioGroupItem value="Yes" id="sw-tag-yes" />
                  <Label htmlFor="sw-tag-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="sw-tag-no" />
                  <Label htmlFor="sw-tag-no">No</Label>
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
                  <RadioGroupItem value="Yes" id="sw-cable-tag-yes" />
                  <Label htmlFor="sw-cable-tag-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="sw-cable-tag-no" />
                  <Label htmlFor="sw-cable-tag-no">No</Label>
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
                  <RadioGroupItem value="Yes" id="sw-gland-yes" />
                  <Label htmlFor="sw-gland-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="sw-gland-no" />
                  <Label htmlFor="sw-gland-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Cable Gland & Plug Are Certified */}
            <RadioGroup
              value={formData.checklist.cablePlugCertified}
              onValueChange={(val) =>
                handleChecklistChange("cablePlugCertified", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Cable Gland & Plug Are Certified
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="sw-plug-yes" />
                  <Label htmlFor="sw-plug-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="sw-plug-no" />
                  <Label htmlFor="sw-plug-no">No</Label>
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
                  <RadioGroupItem value="Yes" id="sw-earth-yes" />
                  <Label htmlFor="sw-earth-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="sw-earth-no" />
                  <Label htmlFor="sw-earth-no">No</Label>
                </div>
              </div>
            </RadioGroup>

            {/* Wire Terminals Are Tightly */}
            <RadioGroup
              value={formData.checklist.terminalsTight}
              onValueChange={(val) =>
                handleChecklistChange("terminalsTight", val)
              }
              className="mb-4"
            >
              <Label className="block font-semibold capitalize mb-1">
                Wire Terminals Are Tightly
              </Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="sw-terminals-yes" />
                  <Label htmlFor="sw-terminals-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="sw-terminals-no" />
                  <Label htmlFor="sw-terminals-no">No</Label>
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
                  <RadioGroupItem value="Pass" id="sw-function-pass" />
                  <Label htmlFor="sw-function-pass">Pass</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Fail" id="sw-function-fail" />
                  <Label htmlFor="sw-function-fail">Fail</Label>
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
                  <RadioGroupItem value="Good" id="sw-dcs-good" />
                  <Label htmlFor="sw-dcs-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="sw-dcs-bad" />
                  <Label htmlFor="sw-dcs-bad">Bad</Label>
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
                  <RadioGroupItem value="Good" id="sw-housing-good" />
                  <Label htmlFor="sw-housing-good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bad" id="sw-housing-bad" />
                  <Label htmlFor="sw-housing-bad">Bad</Label>
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
          <Label htmlFor="sw-comments">Comments</Label>
          <Textarea
            id="sw-comments"
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
