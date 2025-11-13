import type { Instrument } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";


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
              <td className="p-2">{inst.Tag}</td>
              <td className="p-2">{inst["Calibration sheet Form"]}</td>
              <td className="p-2">{inst["Upper Equipment"]}</td>
              {showAll && (
                <>
                  <td className="p-2">
                    {inst.LRV !== undefined && inst.URV !== undefined
                      ? `${inst.LRV} - ${inst.URV}`
                      : "N/A"}
                  </td>
                  <td className="p-2">{inst.Unit}</td>
                  <td className="p-2">
                    {inst["Valve Size"] !== undefined
                      ? `${inst["Valve Size"]}"`
                      : "N/A"}
                  </td>
                  <td className="p-2">
                    {inst["Switch Healthy SP"] !== undefined &&
                    inst["Switch Active SP"] !== undefined
                      ? `H:${inst["Switch Healthy SP"]} / A:${inst["Switch Active SP"]}`
                      : "N/A"}
                  </td>
                  <td className="p-2">{inst["PCV SP"] || "N/A"}</td>
                </>
              )}
              <td className="p-2">{inst.Comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
