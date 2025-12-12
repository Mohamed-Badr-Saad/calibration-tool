
import type { Instrument } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useVirtualizer } from "@tanstack/react-virtual";
import React from "react";

const BADGE_COLORS = {
  Transmitter: "bg-blue-100 text-blue-800",
  Gauge: "bg-green-100 text-green-800",
  "Control Valve": "bg-purple-100 text-purple-800",
  "On-Off Valve": "bg-orange-100 text-orange-800",
  Switch: "bg-red-100 text-red-800",
  PCV: "bg-yellow-100 text-yellow-800",
} as const;

const getBadgeColor = (formType: string) =>
  BADGE_COLORS[formType as keyof typeof BADGE_COLORS] ||
  "bg-gray-100 text-gray-800";

interface Props {
  instruments: Instrument[];
  selected: string[];
  toggleSelect: (id: string) => void;
  showAll?: boolean;
  height?: number; // px height of visible table
  rowHeight?: number; // px height per row
}

export default function UserInstrumentTable({
  instruments,
  selected,
  toggleSelect,
  showAll = false,
  height = 444,
  rowHeight = 48,
}: Props) {
  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: instruments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
  });
  if (!instruments.length) {
    return null;
  }
  return (
    <div className="border rounded-2xl p-4">
      <div
        className={`grid ${
          showAll ? "grid-cols-10" : "grid-cols-5"
        } font-semibold bg-gray-50 py-2 `}
      >
        <div>Select</div>
        <div>Tag</div>
        <div>Type</div>
        <div>Upper Equipment</div>
        {showAll && (
          <>
            <div>Range</div>
            <div>Unit</div>
            <div>Valve Size</div>
            <div>Switch SP</div>
            <div>PCV SP</div>
          </>
        )}
        <div>Comment</div>
      </div>
      <div
        ref={parentRef}
        style={{ height, overflow: "auto", position: "relative" }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const inst = instruments[virtualRow.index];
            return (
              <div
                key={inst._id}
                className={`grid items-center border-b ${
                  showAll ? "grid-cols-10" : "grid-cols-5"
                }`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                  minHeight: rowHeight,
                }}
              >
                {/* Checkbox with blue when checked */}
                <div>
                  <Checkbox
                    className={
                      selected.includes(inst._id)
                        ? "border-blue-600 bg-blue-50" // customize/your-checkbox-classes
                        : ""
                    }
                    checked={selected.includes(inst._id)}
                    onCheckedChange={() => toggleSelect(inst._id)}
                  />
                </div>
                <div className="font-medium">{inst.Tag}</div>
                <div>
                  <span
                    className={`${getBadgeColor(
                      inst["Calibration sheet Form"]
                    )} w-fit rounded-[5px] px-2 py-1 text-xs font-semibold`}
                  >
                    {inst["Calibration sheet Form"]}
                  </span>
                </div>
                <div>{inst["Upper Equipment"]}</div>
                {showAll && (
                  <>
                    <div>
                      {inst.LRV !== undefined && inst.URV !== undefined
                        ? `${inst.LRV} - ${inst.URV}`
                        : "N/A"}
                    </div>
                    <div>{inst.Unit || "N/A"}</div>
                    <div>
                      {inst["Valve Size"] !== undefined
                        ? `${inst["Valve Size"]}"`
                        : "N/A"}
                    </div>
                    <div>
                      {inst["Switch Healthy SP"] !== undefined &&
                      inst["Switch Active SP"] !== undefined
                        ? `H:${inst["Switch Healthy SP"]} / A:${inst["Switch Active SP"]}`
                        : "N/A"}
                    </div>
                    <div>{inst["PCV SP"] || "N/A"}</div>
                  </>
                )}
                <div>{inst.Comment}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
