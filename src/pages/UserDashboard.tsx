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
import { Search, X, ChevronDown, RefreshCw, Eye } from "lucide-react";
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
          <div className="border-2 border-blue-200 bg-blue-50/50 p-8 rounded-2xl">
            <div className="flex justify-between mb-8 gap-3">
              <div className="text-lg font-semibold text-blue-700">
                Calibration Sheets Generation
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
                <SelectContent className="bg-blue-50/50">
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
            <div className="flex gap-2 mb-8">
              <Button
                onClick={applySearch}
                disabled={!hasInputChanges}
                className="flex items-center gap-2 shadow-stone-500"
              >
                <Search className="h-4 w-4" />
                Search Instruments
              </Button>
              <Button
                onClick={showAllInstruments}
                className="flex items-center gap-2 shadow-stone-500"
              >
                <Eye className="h-4 w-4" />
                Show All Instruments ({instruments?.length || 0})
              </Button>
              <Button
                className="flex items-center gap-2 shadow-stone-500"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? "Show Less Columns" : "Show More Columns"}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2"
                >
                  Clear Filters <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {appliedFilters.tag && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Tag: {appliedFilters.tag}
                    <button
                      onClick={() => handleRemoveFilter("tag")}
                      title="Remove filter"
                    >
                      <X className="h-3 w-3 text-red-600" />
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
                      title="Remove filter"
                    >
                      <X className="h-3 w-3 text-red-600" />
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
                      title="Remove filter"
                    >
                      <X className="h-3 w-3 text-red-600" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
            <div className="flex gap-2 mb-2">
              <Button variant="outline" size="sm" onClick={selectAllFiltered}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear All
              </Button>
              <Button
                className="btn btn-primary"
                disabled={selected.length === 0}
                onClick={proceedToCalibration}
                variant="outline"
              >
                Proceed to Calibration ({selected.length})
              </Button>
            </div>
          </div>

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
                  Use the search filters above to find specific instruments, or
                  click "Show All Instruments" to view everything.
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
        </CardContent>
      </Card>
    </div>
  );
}
