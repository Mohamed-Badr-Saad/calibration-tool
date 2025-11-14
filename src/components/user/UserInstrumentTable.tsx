import type { Instrument } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "lucide-react";

interface Props {
  instruments: Instrument[];
  selected: string[];
  toggleSelect: (id: string) => void;
  showAll?: boolean;
}

export default function UserInstrumentTable({
  instruments,
  selected,
  toggleSelect,
  showAll = false,
}: Props) {
  const BADGE_COLORS = {
    Transmitter: "bg-blue-100 text-blue-800",
    Gauge: "bg-green-100 text-green-800",
    "Control Valve": "bg-purple-100 text-purple-800",
    "On-Off Valve": "bg-orange-100 text-orange-800",
    Switch: "bg-red-100 text-red-800",
    PCV: "bg-yellow-100 text-yellow-800",
  } as const;

  const getBadgeColor = (formType: string) => {
    return (
      BADGE_COLORS[formType as keyof typeof BADGE_COLORS] ||
      "bg-gray-100 text-gray-800"
    );
  };

  if (!instruments.length) {
    return (
      <div className="w-full text-center text-sm text-gray-400 py-6">
        No instruments found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 ">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 border-b text-left font-medium text-gray-700">
              Select
            </th>
            <th className="p-2 border-b text-left font-medium text-gray-700">
              Tag
            </th>
            <th className="p-2 border-b text-left font-medium text-gray-700">
              Type
            </th>
            <th className="p-2 border-b text-left font-medium text-gray-700">
              Upper Equipment
            </th>
            {showAll && (
              <>
                <th className="p-2 border-b text-left font-medium text-gray-700">
                  Range
                </th>
                <th className="p-2 border-b text-left font-medium text-gray-700">
                  Unit
                </th>
                <th className="p-2 border-b text-left font-medium text-gray-700">
                  Valve Size
                </th>
                <th className="p-2 border-b text-left font-medium text-gray-700">
                  Switch SP
                </th>
                <th className="p-2 border-b text-left font-medium text-gray-700">
                  PCV SP
                </th>
              </>
            )}
            <th className="p-2 border-b text-left font-medium text-gray-700">
              Comment
            </th>
          </tr>
        </thead>
        <tbody>
          {instruments.map((inst) => (
            <tr key={inst._id} className="border-b hover:bg-gray-50">
              <td className="p-2">
                <Checkbox
                  checked={selected.includes(inst._id!)}
                  onCheckedChange={() => toggleSelect(inst._id!)}
                />
              </td>
              <td className="p-4">
                <div className="font-medium text-[1.2em] text-gray-900">
                  {inst.Tag}
                </div>
              </td>
              <td className="p-4 text-[1.2em]">
                <div
                  className={`${getBadgeColor(
                    inst["Calibration sheet Form"]
                  )} w-fit rounded-[5px] px-2 py-1 text-xs font-semibold`}
                >
                  {inst["Calibration sheet Form"]}
                </div>
              </td>
              <td className="p-4 text-[1.2em] text-gray-600">
                {inst["Upper Equipment"]}
              </td>
              {showAll && (
                <>
                  <td className="p-2 text-[1.2em]">
                    {inst.LRV !== undefined && inst.URV !== undefined
                      ? `${inst.LRV} - ${inst.URV}`
                      : "N/A"}
                  </td>
                  <td className="p-2 text-[1.2em]">{inst.Unit}</td>
                  <td className="p-2 text-[1.2em]">
                    {inst["Valve Size"] !== undefined
                      ? `${inst["Valve Size"]}"`
                      : "N/A"}
                  </td>
                  <td className="p-2 text-[1.2em]">
                    {inst["Switch Healthy SP"] !== undefined &&
                    inst["Switch Active SP"] !== undefined
                      ? `H:${inst["Switch Healthy SP"]} / A:${inst["Switch Active SP"]}`
                      : "N/A"}
                  </td>
                  <td className="p-2 text-[1.2em]">
                    {inst["PCV SP"] || "N/A"}
                  </td>
                </>
              )}
              <td className="p-2 text-[1.2em]">{inst.Comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
