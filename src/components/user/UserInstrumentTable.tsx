// import type { Instrument } from "@/types";
// import { Checkbox } from "@/components/ui/checkbox";
// import { FixedSizeList } from "react-window"
// import React from "react";

// interface Props {
//   instruments: Instrument[];
//   selected: string[];
//   toggleSelect: (id: string) => void;
//   showAll?: boolean;
//   height?: number; // px height of visible table,
//   rowHeight?: number; // px height per row,
// }

// const BADGE_COLORS = {
//   Transmitter: "bg-blue-100 text-blue-800",
//   Gauge: "bg-green-100 text-green-800",
//   "Control Valve": "bg-purple-100 text-purple-800",
//   "On-Off Valve": "bg-orange-100 text-orange-800",
//   Switch: "bg-red-100 text-red-800",
//   PCV: "bg-yellow-100 text-yellow-800",
// } as const;

// const getBadgeColor = (formType: string) => {
//   return (
//     BADGE_COLORS[formType as keyof typeof BADGE_COLORS] ||
//     "bg-gray-100 text-gray-800"
//   );
// };

// export default function UserInstrumentTable({
//   instruments,
//   selected,
//   toggleSelect,
//   showAll = false,
//   height = 440, // default: 440px viewport
//   rowHeight = 48, // default: 48px per row
// }: Props) {
//   if (!instruments.length) {
//     return (
//       <div className="w-full text-center text-sm text-gray-400 py-6">
//         No instruments found.
//       </div>
//     );
//   }

//   const Row = ({
//     index,
//     style,
//   }: {
//     index: number;
//     style: React.CSSProperties;
//   }) => {
//     const inst = instruments[index];
//     return (
//       <tr key={inst._id} className="border-b hover:bg-gray-50">
//         <td className="p-2">
//           <Checkbox
//             checked={selected.includes(inst._id!)}
//             onCheckedChange={() => toggleSelect(inst._id!)}
//           />
//         </td>
//         <td className="p-4">
//           <div className="font-medium text-[1.2em] text-gray-900">
//             {inst.Tag}
//           </div>
//         </td>
//         <td className="p-4 text-[1.2em]">
//           <div
//             className={`${getBadgeColor(
//               inst["Calibration sheet Form"]
//             )} w-fit rounded-[5px] px-2 py-1 text-xs font-semibold`}
//           >
//             {inst["Calibration sheet Form"]}
//           </div>
//         </td>
//         <td className="p-4 text-[1.2em] text-gray-600">
//           {inst["Upper Equipment"]}
//         </td>
//         {showAll && (
//           <>
//             <td className="p-2 text-[1.2em]">
//               {inst.LRV !== undefined && inst.URV !== undefined
//                 ? `${inst.LRV} - ${inst.URV}`
//                 : "N/A"}
//             </td>
//             <td className="p-2 text-[1.2em]">{inst.Unit}</td>
//             <td className="p-2 text-[1.2em]">
//               {inst["Valve Size"] !== undefined
//                 ? `${inst["Valve Size"]}"`
//                 : "N/A"}
//             </td>
//             <td className="p-2 text-[1.2em]">
//               {inst["Switch Healthy SP"] !== undefined &&
//               inst["Switch Active SP"] !== undefined
//                 ? `H:${inst["Switch Healthy SP"]} / A:${inst["Switch Active SP"]}`
//                 : "N/A"}
//             </td>
//             <td className="p-2 text-[1.2em]">{inst["PCV SP"] || "N/A"}</td>
//           </>
//         )}
//         <td className="p-2 text-[1.2em]">{inst.Comment}</td>
//       </tr>
//     );
//   };

//   return (
//     <div className="overflow-x-auto rounded-lg border border-gray-200 ">
//       <table className="min-w-full text-sm">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="p-2 border-b text-left font-medium text-gray-700">
//               Select
//             </th>
//             <th className="p-2 border-b text-left font-medium text-gray-700">
//               Tag
//             </th>
//             <th className="p-2 border-b text-left font-medium text-gray-700">
//               Type
//             </th>
//             <th className="p-2 border-b text-left font-medium text-gray-700">
//               Upper Equipment
//             </th>
//             {showAll && (
//               <>
//                 <th className="p-2 border-b text-left font-medium text-gray-700">
//                   Range
//                 </th>
//                 <th className="p-2 border-b text-left font-medium text-gray-700">
//                   Unit
//                 </th>
//                 <th className="p-2 border-b text-left font-medium text-gray-700">
//                   Valve Size
//                 </th>
//                 <th className="p-2 border-b text-left font-medium text-gray-700">
//                   Switch SP
//                 </th>
//                 <th className="p-2 border-b text-left font-medium text-gray-700">
//                   PCV SP
//                 </th>
//               </>
//             )}
//             <th className="p-2 border-b text-left font-medium text-gray-700">
//               Comment
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           <FixedSizeList
//             height={height}
//             itemCount={instruments.length}
//             itemSize={rowHeight}
//             width="100%"
//           >
//             {({
//               index,
//               style,
//             }: {
//               index: number;
//               style: React.CSSProperties;
//             }) => Row({ index, style })}
//           </FixedSizeList>
//         </tbody>
//       </table>
//     </div>
//   );
// }
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
    return (
null
    );
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
