import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, RotateCcw, RefreshCw } from "lucide-react";
import { useTolerance } from "@/CustomHooks/useTolerance";
import type { ToleranceSettings } from "@/types/index";

const DEFAULT_TOLERANCES: Omit<
  ToleranceSettings,
  "_id" | "createdAt" | "updatedAt"
> = {
  transmitterTolerance: 0.5,
  gaugeTolerance: 1,
  controlValveTolerance: 1,
  onOffValveTimeTolerance: 10,
  onOffValveFeedbackTolerance: 3,
  switchTolerance: 5,
  unit: "%",
};

export default function ToleranceTable() {
  // 🔥 Use the tolerance context
  const { tolerances, loading, error, updateTolerance, refresh } =
    useTolerance();

  // Local state for form data
  const [localTolerances, setLocalTolerances] = useState(DEFAULT_TOLERANCES);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Initialize local state when tolerances are loaded
  useEffect(() => {
    if (tolerances) {
      setLocalTolerances({
        transmitterTolerance: tolerances.transmitterTolerance,
        gaugeTolerance: tolerances.gaugeTolerance,
        controlValveTolerance: tolerances.controlValveTolerance,
        onOffValveTimeTolerance: tolerances.onOffValveTimeTolerance,
        onOffValveFeedbackTolerance: tolerances.onOffValveFeedbackTolerance,
        switchTolerance: tolerances.switchTolerance,
        unit: tolerances.unit,
      });
    }
  }, [tolerances]);

  // Clear message after timeout
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle input changes
  const handleInputChange = (
    field: keyof typeof localTolerances,
    value: string
  ) => {
    if (field === "unit") {
      setLocalTolerances((prev) => ({ ...prev, [field]: value }));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setLocalTolerances((prev) => ({ ...prev, [field]: numValue }));
      } else if (value === "") {
        setLocalTolerances((prev) => ({ ...prev, [field]: 0 }));
      }
    }
  };

  // Save tolerance settings
  const saveTolerance = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await updateTolerance(localTolerances);
      setMessage({
        type: "success",
        text: "Tolerance settings saved successfully!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to save tolerance settings",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset to original values
  const resetTolerances = () => {
    if (tolerances) {
      setLocalTolerances({
        transmitterTolerance: tolerances.transmitterTolerance,
        gaugeTolerance: tolerances.gaugeTolerance,
        controlValveTolerance: tolerances.controlValveTolerance,
        onOffValveTimeTolerance: tolerances.onOffValveTimeTolerance,
        onOffValveFeedbackTolerance: tolerances.onOffValveFeedbackTolerance,
        switchTolerance: tolerances.switchTolerance,
        unit: tolerances.unit,
      });
    }
    setMessage(null);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setLocalTolerances(DEFAULT_TOLERANCES);
    setMessage(null);
  };

  // Check for changes
  const hasChanges = tolerances
    ? JSON.stringify(localTolerances) !==
      JSON.stringify({
        transmitterTolerance: tolerances.transmitterTolerance,
        gaugeTolerance: tolerances.gaugeTolerance,
        controlValveTolerance: tolerances.controlValveTolerance,
        onOffValveTimeTolerance: tolerances.onOffValveTimeTolerance,
        onOffValveFeedbackTolerance: tolerances.onOffValveFeedbackTolerance,
        switchTolerance: tolerances.switchTolerance,
        unit: tolerances.unit,
      })
    : JSON.stringify(localTolerances) !== JSON.stringify(DEFAULT_TOLERANCES);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading tolerance settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-[50%]">
      <CardHeader>
        <CardTitle>Tolerance Settings</CardTitle>
        <p className="text-sm text-gray-600">
          Configure tolerance values for different instrument types
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show error or success message */}
        {(error || message) && (
          <Alert
            className={
              error || message?.type === "error"
                ? "border-red-500 text-red-700"
                : "border-green-500 text-green-700"
            }
          >
            <AlertDescription>{error || message?.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transmitter Tolerance */}
          <div className="space-y-2">
            <Label htmlFor="transmitter-tolerance">Transmitter Tolerance</Label>
            <div className="flex">
              <Input
                id="transmitter-tolerance"
                type="number"
                step="0.1"
                min="0"
                value={localTolerances.transmitterTolerance}
                onChange={(e) =>
                  handleInputChange("transmitterTolerance", e.target.value)
                }
                className="rounded-r-none"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {localTolerances.unit}
              </span>
            </div>
          </div>

          {/* Gauge Tolerance */}
          <div className="space-y-2">
            <Label htmlFor="gauge-tolerance">Gauge Tolerance</Label>
            <div className="flex">
              <Input
                id="gauge-tolerance"
                type="number"
                step="0.1"
                min="0"
                value={localTolerances.gaugeTolerance}
                onChange={(e) =>
                  handleInputChange("gaugeTolerance", e.target.value)
                }
                className="rounded-r-none"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {localTolerances.unit}
              </span>
            </div>
          </div>

          {/* Control Valve Tolerance */}
          <div className="space-y-2">
            <Label htmlFor="control-valve-tolerance">
              Control Valve Tolerance
            </Label>
            <div className="flex">
              <Input
                id="control-valve-tolerance"
                type="number"
                step="0.1"
                min="0"
                value={localTolerances.controlValveTolerance}
                onChange={(e) =>
                  handleInputChange("controlValveTolerance", e.target.value)
                }
                className="rounded-r-none"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {localTolerances.unit}
              </span>
            </div>
          </div>

          {/* On/Off Valve Time Tolerance */}
          <div className="space-y-2">
            <Label htmlFor="onoff-time-tolerance">
              On/Off Valve Time Tolerance
            </Label>
            <div className="flex">
              <Input
                id="onoff-time-tolerance"
                type="number"
                step="0.1"
                min="0"
                value={localTolerances.onOffValveTimeTolerance}
                onChange={(e) =>
                  handleInputChange("onOffValveTimeTolerance", e.target.value)
                }
                className="rounded-r-none"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {localTolerances.unit}
              </span>
            </div>
          </div>

          {/* On/Off Valve Feedback Tolerance */}
          <div className="space-y-2">
            <Label htmlFor="onoff-feedback-tolerance">
              On/Off Valve Feedback Tolerance
            </Label>
            <div className="flex">
              <Input
                id="onoff-feedback-tolerance"
                type="number"
                step="0.1"
                min="0"
                value={localTolerances.onOffValveFeedbackTolerance}
                onChange={(e) =>
                  handleInputChange(
                    "onOffValveFeedbackTolerance",
                    e.target.value
                  )
                }
                className="rounded-r-none"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {localTolerances.unit}
              </span>
            </div>
          </div>

          {/* Switch Tolerance */}
          <div className="space-y-2">
            <Label htmlFor="switch-tolerance">Switch Tolerance</Label>
            <div className="flex">
              <Input
                id="switch-tolerance"
                type="number"
                step="0.1"
                min="0"
                value={localTolerances.switchTolerance}
                onChange={(e) =>
                  handleInputChange("switchTolerance", e.target.value)
                }
                className="rounded-r-none"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {localTolerances.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Unit Selection */}
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            value={localTolerances.unit}
            onChange={(e) => handleInputChange("unit", e.target.value)}
            placeholder="e.g., %, ppm, etc."
            className="w-32"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4">
          <Button
            onClick={saveTolerance}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>

          <Button
            variant="outline"
            onClick={resetTolerances}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Changes
          </Button>

          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              refresh();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 p-4 rounded-lg mt-6">
          <h4 className="font-medium text-blue-900 mb-2">
            About Tolerance Settings
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>Transmitter & Gauge:</strong> Percentage tolerance for
              measurement accuracy
            </li>
            <li>
              • <strong>Control Valve:</strong> Tolerance for valve position
              accuracy
            </li>
            <li>
              • <strong>On/Off Valve Time:</strong> Tolerance for valve
              operation timing
            </li>
            <li>
              • <strong>On/Off Valve Feedback:</strong> Tolerance for position
              feedback accuracy
            </li>
            <li>
              • <strong>Switch:</strong> Tolerance for switch
              activation/deactivation points
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
