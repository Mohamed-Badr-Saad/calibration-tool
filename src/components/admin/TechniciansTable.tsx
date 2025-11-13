import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Edit,
  Trash2,
  Wrench,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { useTechnicians } from "@/CustomHooks/useTechnicians";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { Technician } from "@/types";

export default function TechnicianTable() {
  const {
    technicians,
    addTechnician,
    updateTechnician,
    removeTechnician,
    refresh,
    loading
  } = useTechnicians();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (technicians.length === 0) refresh();
  }, []);

  const handleSave = async () => {
    if (name.trim()) {
      if (editing) await updateTechnician(editing, name.trim());
      else await addTechnician(name.trim());
      setOpen(false);
      setEditing(null);
      setName("");
    }
  };

  const handleEdit = (technician: Technician) => {
    setEditing(technician._id!);
    setName(technician.name);
    setOpen(true);
  };

  const handleAddNew = () => {
    setEditing(null);
    setName("");
    setOpen(true);
  };

  const filtered = technicians.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      handleSave();
    }
  };

  return (
    <div className="space-y-6 min-w-[50%]">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wrench className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Technicians Management
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Manage technical team members
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {filtered.length} technicians
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search technicians by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
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
              {/* Add Button */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant={"outline"}
                    onClick={handleAddNew}
                    className="text-red-400 flex items-center gap-2  hover:cursor-pointer hover:text-red-600 "
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Technician
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-amber-50">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      <Wrench className="h-5 w-5 text-green-600" />
                      {editing ? "Edit Technician" : "Add New Technician"}
                    </DialogTitle>
                    <DialogDescription>
                      {editing
                        ? "Update the technician name below and click save to apply changes."
                        : "Fill in the technician name below and click save to add it to database."}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="technician-name"
                        className="text-sm font-medium"
                      >
                        Technician Name *
                      </Label>
                      <Input
                        id="technician-name"
                        placeholder="Enter technician's full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full"
                        autoFocus
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="flex items-center gap-2"
                      >
                        <Wrench className="h-4 w-4" />
                        {editing ? "Update Technician" : "Add Technician"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technicians Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading Technicians...</p>
            </div>
          ) : (
            <>
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mb-6">
                    <Wrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <div className="text-xl font-medium text-gray-600 mb-2">
                      {search ? "No technicians found" : "No technicians yet"}
                    </div>
                    <div className="text-gray-500 max-w-md mx-auto">
                      {search
                        ? `No technicians match "${search}". Try a different search term.`
                        : "Get started by adding your first technician to the team."}
                    </div>
                  </div>
                  {!search && (
                    <Button
                      onClick={handleAddNew}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add Your First Technician
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Technician Name
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Role
                        </th>
                        <th className="text-right p-4 font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map((technician) => (
                        <tr
                          key={technician._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-medium text-sm">
                                  {technician.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {technician.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Added to team
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              Technician
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(technician)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  removeTechnician(technician._id!)
                                }
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
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
