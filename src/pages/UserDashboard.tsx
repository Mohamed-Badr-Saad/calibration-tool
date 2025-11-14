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
import { Search, X, ChevronDown, RefreshCw } from "lucide-react";
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
  const selectAllFiltered = () => setSelected((prev => {
    const newSelections = filteredIds.filter(id => !prev.includes(id));
    return [...prev, ...newSelections];
  }));
  const deselectAll = () =>
    setSelected((prev) => prev.filter((id) => !filteredIds.includes(id)));

  const proceedToCalibration = () => {
    if (selected.length === 0) return;
    navigate("/calibration-sheets", {
      state: { instrumentIds: selected, engineerName: user?.name || "Unknown" },
    });
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
          <div className="flex justify-between mb-4">
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
              Fetch Instruments
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "Show Less Columns" : "Show More Columns"}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {typeOptions.map((type) => (
                  <SelectItem value={type} key={type}>
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
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search Instruments
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
                <Badge variant="secondary" className="flex items-center gap-1">
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
                <Badge variant="secondary" className="flex items-center gap-1">
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
                <Badge variant="secondary" className="flex items-center gap-1">
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
          <UserInstrumentTable
            instruments={filtered}
            selected={selected}
            toggleSelect={toggleSelect}
            showAll={showAll}
          />
          {hasSearched && filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No instruments found. Adjust your filters or fetch all.
            </div>
          )}
          {!hasSearched && (
            <div className="text-center py-12 text-gray-500">
              Use the filters and click "Fetch Instruments" to start.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
