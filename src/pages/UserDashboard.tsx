import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  ChevronDown,
  RefreshCw,
  Eye,
  EyeOff,
  FileSpreadsheet,
} from "lucide-react";
import UserInstrumentTable from "@/components/user/UserInstrumentTable";
import { useUserInstrumentsContext } from "@/CustomHooks/useUserInstruments";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/CustomHooks/useAuth";

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export default function UserDashboard() {
  const { instruments, loading, fetchInstruments } =
    useUserInstrumentsContext();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    tag: "",
    upperEquipment: "",
    instrumentType: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    tag: "",
    upperEquipment: "",
    instrumentType: "",
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (instruments.length === 0) fetchInstruments();
  }, []);

  const filtered = useMemo(() => {
    if (!hasSearched) return [];
    return instruments.filter((inst) => {
      const { tag, upperEquipment, instrumentType } = appliedFilters;
      if (tag && !inst.Tag?.toLowerCase().includes(tag.toLowerCase()))
        return false;
      if (
        upperEquipment &&
        !inst["Upper Equipment"]
          ?.toLowerCase()
          .includes(upperEquipment.toLowerCase())
      )
        return false;
      if (
        instrumentType &&
        instrumentType !== "all" &&
        instrumentType !== "" &&
        inst["Calibration sheet Form"] !== instrumentType
      )
        return false;
      return true;
    });
  }, [instruments, appliedFilters, hasSearched]);

  const applySearch = () => {
    setAppliedFilters({ ...filters });
    setHasSearched(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") applySearch();
  };
  const clearAllFilters = () => {
    setFilters({ tag: "", upperEquipment: "", instrumentType: "" });
    setAppliedFilters({ tag: "", upperEquipment: "", instrumentType: "" });
    setHasSearched(false);
  };
  const handleRemoveFilter = (filter: keyof typeof appliedFilters) => {
    const newFilters = { ...appliedFilters, [filter]: "" };
    setAppliedFilters(newFilters);
    setFilters(newFilters);
  };
  
  const hasInputChanges =
    filters.tag || filters.upperEquipment || filters.instrumentType;
  const hasActiveFilters =
    appliedFilters.tag ||
    appliedFilters.upperEquipment ||
    appliedFilters.instrumentType;

  // Selection Logic (per filtered view)
  const filteredIds = filtered.map((i) => i._id!).filter(Boolean);
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const clearSelection = () => setSelected([]);
  const selectAllFiltered = () =>
    setSelected((prev) => {
      const newSelections = filteredIds.filter((id) => !prev.includes(id));
      return [...prev, ...newSelections];
    });
  const deselectAll = () =>
    setSelected((prev) => prev.filter((id) => !filteredIds.includes(id)));

  const proceedToCalibration = () => {
    if (selected.length === 0) return;
    navigate("/calibration-sheets", {
      state: { instrumentIds: selected, engineerName: user?.name || "Unknown" },
    });
  };
  interface SearchFilters {
    tag: string;
    upperEquipment: string;
    instrumentType: string;
  }
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    tag: "",
    upperEquipment: "",
    instrumentType: "",
  });

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

  // Filter Options
  const typeOptions = useMemo(
    () =>
      unique(
        instruments.map((i) => i["Calibration sheet Form"]).filter(Boolean)
      ),
    [instruments]
  );

  return (
    <div className="space-y-6 min-w-[60%]">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Instruments</span>
            <Badge variant="secondary" className="text-xs">
              {hasSearched
                ? `${filtered.length} instruments`
                : `${instruments.length} total`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-blue-200 bg-blue-50/50 p-8 rounded-2xl mb-4">
            <div className="flex justify-between mb-8 gap-3">
              <div className="text-lg font-semibold text-blue-700  flex gap-1.5">
                <div>
                  <FileSpreadsheet className="h-6 w-6 text-blue-800" />
                </div>
                <p> Calibration Sheets Generation</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchInstruments}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Input
                placeholder="Filter by Tag (Enter to search)"
                value={filters.tag}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, tag: e.target.value }))
                }
                onKeyPress={handleKeyPress}
              />
              <Input
                placeholder="Filter by Upper Equipment (Enter to search)"
                value={filters.upperEquipment}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    upperEquipment: e.target.value,
                  }))
                }
                onKeyPress={handleKeyPress}
              />
              <Select
                value={filters.instrumentType}
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    instrumentType: val === "all" ? "" : val,
                  }))
                }
              >
                <SelectTrigger className=" bg-blue-800 shadow-stone-500">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent style={{ background: "rgb(239 246 255)" }}>
                  <SelectItem value="all">All Types</SelectItem>
                  {typeOptions.map((type) => (
                    <SelectItem
                      value={type}
                      key={type}
                      className="border-b border-gray-300 hover:bg-gray-300"
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mb-4">
              <Button
                onClick={applySearch}
                disabled={!hasInputChanges}
                className="flex items-center gap-2 shadow-stone-500"
              >
                <Search className="h-4 w-4" />
                Search Instruments
              </Button>
              <Button
                variant="outline"
                onClick={showAllInstruments}
                className="flex items-center gap-2 shadow-stone-500"
              >
                <Eye className="h-4 w-4" />
                Show All Instruments ({instruments?.length || 0})
              </Button>
              {filtered.length > 0 && (
                <Button
                  className="flex items-center gap-2 shadow-stone-500"
                  onClick={() => setShowAll((prev) => !prev)}
                >
                  {showAll ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {showAll ? "Show Less Columns" : "Show More Columns"}
                </Button>
              )}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 ml-5 shadow-stone-500"
                >
                  <X className="h-4 w-4" />
                  Clear & Reset All filters
                </Button>
              )}
            </div>

            <div className="flex flex-row g-4 mb-4">
              {/* Applied Filters Display */}
              {hasActiveFilters && hasSearched && (
                <div className="flex flex-wrap gap-2 pt-4 ">
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
                        onClick={() => handleRemoveFilter("tag")}
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
                        onClick={() => handleRemoveFilter("upperEquipment")}
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
                        onClick={() => handleRemoveFilter("instrumentType")}
                        className="h-3 w-3 rounded-full hover:bg-red-100 flex items-center justify-center"
                      >
                        <X className="h-2 w-2 text-red-600" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-between mb-2 w-full  ">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={selectAllFiltered}
                  style={{ backgroundColor: "rgb(34 197 94)" }}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  onClick={deselectAll}
                  style={{ backgroundColor: " rgb(254 240 138)" }}
                >
                  Deselect All
                </Button>
                <Button
                  variant="outline"
                  onClick={clearSelection}
                  style={{ backgroundColor: " rgb(248 113 113)" }}
                >
                  Clear All
                </Button>
              </div>
              <div className="flex justify-end ">
                <Button
                  className="flex items-center gap-2 shadow-green-900"
                  disabled={selected.length === 0}
                  onClick={proceedToCalibration}
                  variant="outline"
                  style={{ backgroundColor: " rgb(22 135 52)" }}
                >
                  Proceed to Calibration ({selected.length})
                </Button>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="p-8 text-center border rounded-2xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading Instruments...</p>
            </div>
          ) : (
            <div>
              <UserInstrumentTable
                instruments={filtered}
                selected={selected}
                toggleSelect={toggleSelect}
                showAll={showAll}
              />

              {hasSearched && filtered.length === 0 && (
                <div className="text-center py-16 border rounded-2xl p-4 mt-8">
                  <div className="text-gray-500 max-w-md mx-auto">
                    No instruments found. Adjust your filters or fetch all.
                  </div>
                </div>
              )}
              {!hasSearched && (
                <div className="text-center py-16 border rounded-2xl p-4 mt-8">
                  <div className="mb-6">
                    <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <div className="text-xl font-medium text-gray-600 mb-2">
                      Ready to Search
                    </div>
                    <div className="text-gray-500 max-w-md mx-auto">
                      Use the search filters above to find specific instruments,
                      or click "Show All Instruments" to view everything.
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={showAllInstruments}
                      className="flex items-center gap-2 shadow-stone-500"
                    >
                      <Eye className="h-4 w-4" />
                      Show All Instruments ({instruments?.length || 0})
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
