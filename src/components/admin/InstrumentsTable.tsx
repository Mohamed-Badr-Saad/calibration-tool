import { useState, useEffect, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useInstrumentsContext } from "@/CustomHooks/useInstruments";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Filter,
  RefreshCw,
} from "lucide-react";
import type { Instrument } from "@/types/index";

const CALIBRATION_FORMS = [
  "Transmitter",
  "Gauge",
  "Control Valve",
  "On-Off Valve",
  "Switch",
  "PCV",
] as const;

type FormField =
  | "Upper Equipment"
  | "Tag"
  | "URV"
  | "LRV"
  | "Unit"
  | "Valve Size"
  | "Switch Healthy SP"
  | "Switch Active SP"
  | "PCV SP"
  | "Comment";

const FIELD_CONFIG: Record<
  (typeof CALIBRATION_FORMS)[number],
  { disabled: FormField[] }
> = {
  Transmitter: {
    disabled: ["Valve Size", "Switch Healthy SP", "Switch Active SP", "PCV SP"],
  },
  Gauge: {
    disabled: ["Valve Size", "Switch Healthy SP", "Switch Active SP", "PCV SP"],
  },
  "Control Valve": {
    disabled: [
      "URV",
      "LRV",
      "Unit",
      "Switch Healthy SP",
      "Switch Active SP",
      "PCV SP",
    ],
  },
  "On-Off Valve": {
    disabled: [
      "URV",
      "LRV",
      "Unit",
      "Switch Healthy SP",
      "Switch Active SP",
      "PCV SP",
    ],
  },
  Switch: {
    disabled: ["URV", "LRV", "Unit", "Valve Size", "PCV SP"],
  },
  PCV: {
    disabled: ["URV", "LRV", "Unit", "Switch Healthy SP", "Switch Active SP"],
  },
};

const BADGE_COLORS = {
  Transmitter: "bg-blue-100 text-blue-800",
  Gauge: "bg-green-100 text-green-800",
  "Control Valve": "bg-purple-100 text-purple-800",
  "On-Off Valve": "bg-orange-100 text-orange-800",
  Switch: "bg-red-100 text-red-800",
  PCV: "bg-yellow-100 text-yellow-800",
} as const;

// Updated interface to allow "N/A" for number fields
interface InstrumentFormData {
  "Calibration sheet Form": string;
  "Upper Equipment": string;
  Tag: string;
  URV: string;
  LRV: number | string; // Allow both number and "N/A"
  Unit: string;
  "Valve Size": number | string; // Allow both number and "N/A"
  "Switch Healthy SP": string;
  "Switch Active SP": string;
  "PCV SP": string;
  Comment: string;
}

interface SearchFilters {
  tag: string;
  upperEquipment: string;
  instrumentType: string;
}

export default function InstrumentTable() {
  const {
    instruments,
    addInstrument,
    updateInstrument,
    removeInstrument,
    refresh,
    loading,
  } = useInstrumentsContext();

  /****to make autocomplete suggestions for upper equipment in the form of creating/editing an instrument */
  const upperEquipments = useMemo(() => {
    const safeArray = Array.isArray(instruments) ? instruments : [];
    return Array.from(
      new Set(
        safeArray
          .map((ins) => ins["Upper Equipment"])
          .filter((name) => !!name && typeof name === "string")
      )
    );
  }, [instruments]);

  const [upperEquipment, setUpperEquipment] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = upperEquipments.filter(
    (eq) =>
      eq.toLowerCase().includes(upperEquipment.toLowerCase()) &&
      upperEquipment.trim() !== ""
  );

  /*********************************************************** */

  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    tag: "",
    upperEquipment: "",
    instrumentType: "",
  });

  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>({
    tag: "",
    upperEquipment: "",
    instrumentType: "",
  });

  const [hasSearched, setHasSearched] = useState(false);

  const [editing, setEditing] = useState<Instrument | null>(null);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(true);

  const formRefs = useRef<
    Record<FormField, HTMLInputElement | HTMLTextAreaElement | null>
  >({
    "Upper Equipment": null,
    Tag: null,
    URV: null,
    LRV: null,
    Unit: null,
    "Valve Size": null,
    "Switch Healthy SP": null,
    "Switch Active SP": null,
    "PCV SP": null,
    Comment: null,
  });

  const [calibrationForm, setCalibrationForm] = useState<
    (typeof CALIBRATION_FORMS)[number] | ""
  >("");

  useEffect(() => {
    if (!instruments) refresh();
  }, []);

  // 🔥 NEW: Auto-populate form when editing
  useEffect(() => {
    if (open && editing) {
      // Small delay to ensure refs are ready
      setTimeout(() => {
        populateForm(editing);
      }, 100);
    }
  }, [open, editing]);

  const applySearch = () => {
    setAppliedFilters({ ...currentFilters });
    setHasSearched(true);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applySearch();
    }
  };

  const showAllInstruments = () => {
    setCurrentFilters({
      tag: "",
      upperEquipment: "",
      instrumentType: "",
    });
    setAppliedFilters({
      tag: "",
      upperEquipment: "",
      instrumentType: "",
    });
    setHasSearched(true);
  };

  const clearAllFilters = () => {
    setCurrentFilters({
      tag: "",
      upperEquipment: "",
      instrumentType: "",
    });
    setAppliedFilters({
      tag: "",
      upperEquipment: "",
      instrumentType: "",
    });
    setHasSearched(false);
  };

  const getDisabledFields = (): FormField[] => {
    if (!calibrationForm) return [];
    return FIELD_CONFIG[calibrationForm]?.disabled || [];
  };

  const resetForm = () => {
    Object.values(formRefs.current).forEach((ref) => {
      if (ref) {
        ref.value = "";
      }
    });
    setCalibrationForm("");
  };

  // 🔥 IMPROVED: Better populate form function with "N/A" handling
  const populateForm = (inst: Instrument) => {
    if (formRefs.current["Upper Equipment"]) {
      formRefs.current["Upper Equipment"]!.value =
        inst["Upper Equipment"] === "N/A" ? "" : inst["Upper Equipment"] || "";
    }
    if (formRefs.current["Tag"]) {
      formRefs.current["Tag"]!.value = inst.Tag === "N/A" ? "" : inst.Tag || "";
    }
    if (formRefs.current["URV"]) {
      formRefs.current["URV"]!.value = inst.URV === "N/A" ? "" : inst.URV || "";
    }
    if (formRefs.current["LRV"]) {
      formRefs.current["LRV"]!.value =
        inst.LRV === undefined ? "" : inst.LRV.toString();
    }
    if (formRefs.current["Unit"]) {
      formRefs.current["Unit"]!.value =
        inst.Unit === "N/A" ? "" : inst.Unit || "";
    }
    if (formRefs.current["Valve Size"]) {
      formRefs.current["Valve Size"]!.value =
        inst["Valve Size"] === undefined ? "" : inst["Valve Size"].toString();
    }
    if (formRefs.current["Switch Healthy SP"]) {
      formRefs.current["Switch Healthy SP"]!.value =
        inst["Switch Healthy SP"] === "N/A"
          ? ""
          : inst["Switch Healthy SP"] || "";
    }
    if (formRefs.current["Switch Active SP"]) {
      formRefs.current["Switch Active SP"]!.value =
        inst["Switch Active SP"] === "N/A"
          ? ""
          : inst["Switch Active SP"] || "";
    }
    if (formRefs.current["PCV SP"]) {
      formRefs.current["PCV SP"]!.value =
        inst["PCV SP"] === "N/A" ? "" : inst["PCV SP"] || "";
    }
    if (formRefs.current["Comment"]) {
      formRefs.current["Comment"]!.value =
        inst.Comment === "N/A" ? "" : inst.Comment || "";
    }

    setCalibrationForm(
      (inst["Calibration sheet Form"] as (typeof CALIBRATION_FORMS)[number]) ||
        ""
    );
  };

  // 🔥 IMPROVED: Handle "N/A" for empty/disabled fields

  const getFormData = (): InstrumentFormData => {
    const disabledFieldsList = getDisabledFields();

    const getValue = (fieldName: FormField): string | number | null => {
      const ref = formRefs.current[fieldName];
      if (!ref) return null;

      // If field is disabled, return appropriate empty value
      if (disabledFieldsList.includes(fieldName)) {
        // For number fields, return null; for string fields, return "N/A"
        if (fieldName === "LRV" || fieldName === "Valve Size") {
          return 0;
        } else {
          return "N/A";
        }
      }

      const value = ref.value.trim();

      // Handle number input fields
      if (ref.type === "number") {
        if (value === "" || value === "0") {
          return 0; // Send null instead of "N/A" for number fields
        }
        return Number(value);
      }

      // Handle text fields
      return value === "" ? "N/A" : value;
    };

    return {
      "Calibration sheet Form": calibrationForm,
      "Upper Equipment": getValue("Upper Equipment") as string,
      Tag: getValue("Tag") as string,
      URV: getValue("URV") as string,
      LRV: getValue("LRV") as number,
      Unit: getValue("Unit") as string,
      "Valve Size": getValue("Valve Size") as number,
      "Switch Healthy SP": getValue("Switch Healthy SP") as string,
      "Switch Active SP": getValue("Switch Active SP") as string,
      "PCV SP": getValue("PCV SP") as string,
      Comment: getValue("Comment") as string,
    };
  };

  // 🔥 IMPROVED: Don't overwrite existing values when changing calibration type during editing
  const handleCalibrationFormChange = (
    value: (typeof CALIBRATION_FORMS)[number]
  ) => {
    setCalibrationForm(value);

    const config = FIELD_CONFIG[value];
    if (config) {
      config.disabled.forEach((field) => {
        const ref = formRefs.current[field];
        if (ref) {
          // Only set to empty/N/A if the field is currently empty (for new instruments)
          if (
            !editing ||
            !ref.value ||
            ref.value.trim() === "" ||
            ref.value === "0"
          ) {
            if (ref.type === "number") {
              ref.value = ""; // Leave empty for number inputs (will become "N/A" on save)
            } else {
              ref.value = "N/A";
            }
          }
        }
      });
    }
  };

  const handleSave = async () => {
    const formData = getFormData();

    if (editing) {
      await updateInstrument(editing._id!, formData as Instrument);
    } else {
      await addInstrument(formData as Instrument);
    }

    setEditing(null);
    resetForm();
    setOpen(false);
  };

  // 🔥 IMPROVED: Better edit handler
  const handleEditClick = (inst: Instrument) => {
    setEditing(inst);
    setOpen(true); // populateForm will be called by the useEffect
  };

  const handleDelete = (id: string) => {
    removeInstrument(id);
  };

  const filtered = !hasSearched
    ? []
    : instruments?.filter((inst) => {
        const { tag, upperEquipment, instrumentType } = appliedFilters;

        if (!tag && !upperEquipment && !instrumentType) {
          return true;
        }

        if (tag && !inst.Tag.toLowerCase().includes(tag.toLowerCase())) {
          return false;
        }

        if (
          upperEquipment &&
          !inst["Upper Equipment"]
            .toLowerCase()
            .includes(upperEquipment.toLowerCase())
        ) {
          return false;
        }

        if (
          instrumentType &&
          instrumentType !== "all" &&
          instrumentType !== "" &&
          inst["Calibration sheet Form"] !== instrumentType
        ) {
          return false;
        }

        return true;
      }) || [];

  const clearTagFilter = () => {
    const newFilters = { ...appliedFilters, tag: "" };
    setAppliedFilters(newFilters);
    setCurrentFilters(newFilters);
  };

  const clearEquipmentFilter = () => {
    const newFilters = { ...appliedFilters, upperEquipment: "" };
    setAppliedFilters(newFilters);
    setCurrentFilters(newFilters);
  };

  const clearTypeFilter = () => {
    const newFilters = { ...appliedFilters, instrumentType: "" };
    setAppliedFilters(newFilters);
    setCurrentFilters(newFilters);
  };

  const hasActiveFilters =
    appliedFilters.tag ||
    appliedFilters.upperEquipment ||
    appliedFilters.instrumentType;
  const hasInputChanges =
    currentFilters.tag ||
    currentFilters.upperEquipment ||
    currentFilters.instrumentType;

  const getBadgeColor = (formType: string) => {
    return (
      BADGE_COLORS[formType as keyof typeof BADGE_COLORS] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const disabledFields = getDisabledFields();

  return (
    <div className="space-y-6 min-w-[50%]">
      {/* Header with Advanced Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Instruments Management</span>
            <Badge variant="secondary">
              {hasSearched
                ? `${filtered.length} instruments`
                : `${instruments?.length || 0} total`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {showAdvancedSearch ? "Hide Search" : "Show Search"}
                {hasActiveFilters && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {
                      [
                        appliedFilters.tag,
                        appliedFilters.upperEquipment,
                        appliedFilters.instrumentType,
                      ].filter(Boolean).length
                    }
                  </Badge>
                )}
              </Button>

              <div className="flex gap-2">
                {hasSearched && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                    className="flex items-center gap-2"
                  >
                    {showAll ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {showAll ? "Show Less" : "Show All Columns"}
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => {
                      refresh();
                    }}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditing(null);
                          resetForm();
                        }}
                        variant={"outline"}
                        className="text-red-400 flex items-center gap-2  hover:cursor-pointer hover:text-red-600 "
                      >
                        <Plus className="h-4 w-4" />
                        Add Instrument
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-amber-50 ">
                      <DialogHeader>
                        <DialogTitle className="text-xl">
                          {editing ? "Edit Instrument" : "Add New Instrument"}
                        </DialogTitle>
                        <DialogDescription>
                          {editing
                            ? "Update the instrument details below and click save to apply changes."
                            : "Fill in the instrument information below and click save to add it to database."}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Calibration Sheet Form */}
                        <Card className="border-2 border-blue-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-blue-700">
                              Instrument Type
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Label
                                htmlFor="calibration-form"
                                className="text-sm font-medium"
                              >
                                Calibration Sheet Form *
                              </Label>
                              <Select
                                value={calibrationForm}
                                onValueChange={handleCalibrationFormChange}
                              >
                                <SelectTrigger
                                  style={{
                                    backgroundColor: "#fffbe8",
                                    border: "1px solid blue",
                                    boxShadow: "0 1px 3px rgba(0,0,2,1)",
                                  }}
                                  className="!bg-[#fffbe8] !border-[#d1d5db] !text-gray-900"
                                  id="calibration-form"
                                >
                                  <SelectValue placeholder="Select calibration sheet form" />
                                </SelectTrigger>
                                <SelectContent
                                  style={{ backgroundColor: "#fffbe8" }}
                                >
                                  {CALIBRATION_FORMS.map((formType) => (
                                    <SelectItem
                                      key={formType}
                                      value={formType}
                                      className="border-b border-gray-300 hover:bg-blue-50"
                                    >
                                      {formType}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Basic Information */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">
                              Basic Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label
                                  htmlFor="upper-equipment"
                                  className="text-sm font-medium"
                                >
                                  Upper Equipment
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="upper-equipment"
                                    value={upperEquipment}
                                    onChange={(e) => {
                                      setUpperEquipment(
                                        e.target.value.toUpperCase()
                                      );
                                      setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() =>
                                      setTimeout(
                                        () => setShowSuggestions(false),
                                        100
                                      )
                                    }
                                    placeholder={
                                      disabledFields.includes("Upper Equipment")
                                        ? "N/A (disabled)"
                                        : "Enter upper equipment"
                                    }
                                    ref={(el) => {
                                      formRefs.current["Upper Equipment"] = el;
                                    }}
                                    disabled={disabledFields.includes(
                                      "Upper Equipment"
                                    )}
                                  />
                                  {showSuggestions &&
                                    filteredSuggestions.length > 0 && (
                                      <ul
                                        style={{
                                          backgroundColor: "#fffbe8",
                                          maxHeight: "12rem", // Example: 12rem = 192px, adjust as needed
                                          overflowY: "auto",
                                        }}
                                        className="absolute z-10 w-full border border-gray-300 rounded shadow"
                                      >
                                        {filteredSuggestions.map(
                                          (suggestion) => (
                                            <li
                                              key={suggestion}
                                              className="cursor-pointer hover:bg-blue-50 px-4 py-2"
                                              onMouseDown={() => {
                                                setUpperEquipment(suggestion);
                                                setShowSuggestions(false);
                                              }}
                                            >
                                              {suggestion}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="tag"
                                  className="text-sm font-medium"
                                >
                                  Tag *
                                </Label>
                                <Input
                                  id="tag"
                                  placeholder={
                                    disabledFields.includes("Tag")
                                      ? "N/A (disabled)"
                                      : "Enter instrument tag"
                                  }
                                  ref={(el) => {
                                    formRefs.current["Tag"] = el;
                                  }}
                                  disabled={disabledFields.includes("Tag")}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Range & Unit */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">
                              Range & Unit Configuration
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label
                                  htmlFor="lrv"
                                  className="text-sm font-medium"
                                >
                                  LRV (Lower Range Value)
                                </Label>
                                <Input
                                  id="lrv"
                                  type="number"
                                  placeholder={
                                    disabledFields.includes("LRV")
                                      ? "N/A (disabled)"
                                      : "Enter LRV"
                                  }
                                  ref={(el) => {
                                    formRefs.current["LRV"] = el;
                                  }}
                                  disabled={disabledFields.includes("LRV")}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="urv"
                                  className="text-sm font-medium"
                                >
                                  URV (Upper Range Value)
                                </Label>
                                <Input
                                  id="urv"
                                  type="number"
                                  placeholder={
                                    disabledFields.includes("URV")
                                      ? "N/A (disabled)"
                                      : "Enter URV"
                                  }
                                  ref={(el) => {
                                    formRefs.current["URV"] = el;
                                  }}
                                  disabled={disabledFields.includes("URV")}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="unit"
                                  className="text-sm font-medium"
                                >
                                  Unit
                                </Label>
                                <Input
                                  id="unit"
                                  placeholder={
                                    disabledFields.includes("Unit")
                                      ? "N/A (disabled)"
                                      : "e.g., bar, °C, %"
                                  }
                                  ref={(el) => {
                                    formRefs.current["Unit"] = el;
                                  }}
                                  disabled={disabledFields.includes("Unit")}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Valve & Switch */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">
                              Valve & Switch Configuration
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label
                                  htmlFor="valve-size"
                                  className="text-sm font-medium"
                                >
                                  Valve Size (Inch)
                                </Label>
                                <Input
                                  id="valve-size"
                                  type="number"
                                  placeholder={
                                    disabledFields.includes("Valve Size")
                                      ? "N/A (disabled)"
                                      : "Enter Valve Size"
                                  }
                                  ref={(el) => {
                                    formRefs.current["Valve Size"] = el;
                                  }}
                                  disabled={disabledFields.includes(
                                    "Valve Size"
                                  )}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="pcv-sp"
                                  className="text-sm font-medium"
                                >
                                  PCV Set Point
                                </Label>
                                <Input
                                  id="pcv-sp"
                                  placeholder={
                                    disabledFields.includes("PCV SP")
                                      ? "N/A (disabled)"
                                      : "Enter PCV SP"
                                  }
                                  type="number"
                                  ref={(el) => {
                                    formRefs.current["PCV SP"] = el;
                                  }}
                                  disabled={disabledFields.includes("PCV SP")}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="switch-healthy"
                                  className="text-sm font-medium"
                                >
                                  Switch Healthy SP
                                </Label>
                                <Input
                                  id="switch-healthy"
                                  type="number"
                                  placeholder={
                                    disabledFields.includes("Switch Healthy SP")
                                      ? "N/A (disabled)"
                                      : "Enter healthy setpoint"
                                  }
                                  ref={(el) => {
                                    formRefs.current["Switch Healthy SP"] = el;
                                  }}
                                  disabled={disabledFields.includes(
                                    "Switch Healthy SP"
                                  )}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="switch-active"
                                  className="text-sm font-medium"
                                >
                                  Switch Active SP
                                </Label>
                                <Input
                                  id="switch-active"
                                  type="number"
                                  placeholder={
                                    disabledFields.includes("Switch Active SP")
                                      ? "N/A (disabled)"
                                      : "Enter active setpoint"
                                  }
                                  ref={(el) => {
                                    formRefs.current["Switch Active SP"] = el;
                                  }}
                                  disabled={disabledFields.includes(
                                    "Switch Active SP"
                                  )}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Comments */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">
                              Additional Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Label
                                htmlFor="comment"
                                className="text-sm font-medium"
                              >
                                Comments
                              </Label>
                              <Textarea
                                id="comment"
                                placeholder={
                                  disabledFields.includes("Comment")
                                    ? "N/A (disabled)"
                                    : "Enter any additional comments..."
                                }
                                ref={(el) => {
                                  formRefs.current["Comment"] = el;
                                }}
                                rows={3}
                                disabled={disabledFields.includes("Comment")}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSave}
                            disabled={!calibrationForm}
                          >
                            {editing ? "Update Instrument" : "Save Instrument"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Search Panel */}
            {showAdvancedSearch && (
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Search Instruments
                    </CardTitle>
                    <div className="flex gap-2">
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                          Clear & Reset
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Tag Filter */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="search-tag"
                          className="text-sm font-medium"
                        >
                          Search by Tag
                        </Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="search-tag"
                            placeholder="Enter tag... (Press Enter)"
                            value={currentFilters.tag}
                            onChange={(e) =>
                              setCurrentFilters((prev) => ({
                                ...prev,
                                tag: e.target.value,
                              }))
                            }
                            onKeyPress={handleSearchKeyPress}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Upper Equipment Filter */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="search-equipment"
                          className="text-sm font-medium"
                        >
                          Search by Upper Equipment
                        </Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="search-equipment"
                            placeholder="Enter equipment... (Press Enter)"
                            value={currentFilters.upperEquipment}
                            onChange={(e) =>
                              setCurrentFilters((prev) => ({
                                ...prev,
                                upperEquipment: e.target.value,
                              }))
                            }
                            onKeyPress={handleSearchKeyPress}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Instrument Type Filter */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="search-type"
                          className="text-sm font-medium"
                        >
                          Filter by Instrument Type
                        </Label>
                        <Select
                          value={currentFilters.instrumentType}
                          onValueChange={(value) => {
                            const newValue = value === "all" ? "" : value;
                            setCurrentFilters((prev) => ({
                              ...prev,
                              instrumentType: newValue,
                            }));
                            setAppliedFilters((prev) => ({
                              ...prev,
                              instrumentType: newValue,
                            }));
                            setHasSearched(true);
                          }}
                        >
                          <SelectTrigger id="search-type">
                            <SelectValue placeholder="All instrument types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {CALIBRATION_FORMS.map((formType) => (
                              <SelectItem key={formType} value={formType}>
                                {formType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Search Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button
                        onClick={applySearch}
                        disabled={!hasInputChanges}
                        className="flex items-center gap-2"
                      >
                        <Search className="h-4 w-4" />
                        Search Instruments
                      </Button>

                      <Button
                        variant="outline"
                        onClick={showAllInstruments}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Show All Instruments
                      </Button>

                      <span className="text-sm text-gray-500 flex items-center">
                        💡 Press Enter in search fields or click Search button
                      </span>
                    </div>

                    {/* Applied Filters Display */}
                    {hasActiveFilters && hasSearched && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-blue-200">
                        <span className="text-sm font-medium text-blue-700">
                          Active Filters:
                        </span>
                        {appliedFilters.tag && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            Tag: {appliedFilters.tag}
                            <button
                              onClick={clearTagFilter}
                              className="h-3 w-3 rounded-full hover:bg-red-100 flex items-center justify-center"
                            >
                              <X className="h-2 w-2 text-red-600" />
                            </button>
                          </Badge>
                        )}
                        {appliedFilters.upperEquipment && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            Equipment: {appliedFilters.upperEquipment}
                            <button
                              onClick={clearEquipmentFilter}
                              className="h-3 w-3 rounded-full hover:bg-red-100 flex items-center justify-center"
                            >
                              <X className="h-2 w-2 text-red-600" />
                            </button>
                          </Badge>
                        )}
                        {appliedFilters.instrumentType && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            Type: {appliedFilters.instrumentType}
                            <button
                              onClick={clearTypeFilter}
                              className="h-3 w-3 rounded-full hover:bg-red-100 flex items-center justify-center"
                            >
                              <X className="h-2 w-2 text-red-600" />
                            </button>
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table with Empty State until Search */}
      <Card>
        <CardContent className="p-0">
          {!hasSearched ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <div className="text-xl font-medium text-gray-600 mb-2">
                  Ready to Search
                </div>
                <div className="text-gray-500 max-w-md mx-auto">
                  Use the search filters above to find specific instruments, or
                  click "Show All Instruments" to view everything.
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={showAllInstruments}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Show All Instruments ({instruments?.length || 0})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedSearch(true)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Start Searching
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">
                      Tag
                    </th>
                    <th className="text-left p-4 font-medium text-gray-700">
                      Type
                    </th>
                    <th className="text-left p-4 font-medium text-gray-700">
                      Upper Equipment
                    </th>
                    {showAll && (
                      <>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Range
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Unit
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Valve Size
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Switch SP
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          PCV SP
                        </th>
                      </>
                    )}
                    <th className="text-left p-4 font-medium text-gray-700">
                      Comment
                    </th>
                    <th className="text-right p-4 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((inst) => (
                    <tr
                      key={inst._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {inst.Tag}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          className={getBadgeColor(
                            inst["Calibration sheet Form"]
                          )}
                        >
                          {inst["Calibration sheet Form"]}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-600">
                        {inst["Upper Equipment"]}
                      </td>
                      {showAll && (
                        <>
                          <td className="p-4 text-gray-600">
                            {inst.LRV !== undefined && inst.URV !== undefined
                              ? `${inst.LRV} - ${inst.URV}`
                              : "N/A"}
                          </td>
                          <td className="p-4 text-gray-600">
                            {inst.Unit || "N/A"}
                          </td>
                          <td className="p-4 text-gray-600">
                            {inst["Valve Size"] !== undefined
                              ? `${inst["Valve Size"]}"`
                              : "N/A"}
                          </td>
                          <td className="p-4 text-gray-600">
                            {inst["Switch Healthy SP"] !== undefined &&
                            inst["Switch Active SP"] !== undefined
                              ? `H:${inst["Switch Healthy SP"]} / A:${inst["Switch Active SP"]}`
                              : "N/A"}
                          </td>
                          <td className="p-4 text-gray-600">
                            {inst["PCV SP"] || "N/A"}
                          </td>
                        </>
                      )}
                      <td className="p-4 text-gray-600 max-w-xs truncate">
                        {inst.Comment || "No comments"}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(inst)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(inst._id!)}
                            className="h-8 w-8 p-0"
                            style={{ color: "red" }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">
                    No instruments found
                  </div>
                  <div className="text-gray-400 text-sm mb-4">
                    Try adjusting your search filters or search for different
                    criteria
                  </div>
                  <Button variant="outline" onClick={showAllInstruments}>
                    Show All Instruments Instead
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
