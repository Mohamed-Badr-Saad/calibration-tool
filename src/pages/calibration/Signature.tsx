import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Technician } from "@/types";
import React from "react";

const Signature = ({ technicians }: { technicians: Technician[] }) => {
  const [tech, setTech] = React.useState<string>("");
  return (
    <div className="grid grid-cols-3 gap-4 items-end">
      <Select onValueChange={(val) => setTech(val)}>
        <SelectTrigger>
          <SelectValue placeholder="Created By" />
        </SelectTrigger>
        <SelectContent>
          {technicians.map((tech) => (
            <SelectItem key={tech._id} value={tech.name}>
              {tech.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Signature;
