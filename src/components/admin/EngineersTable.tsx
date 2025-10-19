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
import { Search, Edit, Trash2, Users, UserPlus } from "lucide-react";
import { useEngineers } from "@/CustomHooks/useEngineers";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { Engineer } from "@/types";

export default function EngineerTable() {
  const { engineers, addEngineer, updateEngineer, removeEngineer, refresh } =
    useEngineers();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (engineers.length === 0) refresh();
  }, []);

  const handleSave = async () => {
    if (name.trim()) {
      if (editing) await updateEngineer(editing, name.trim());
      else await addEngineer(name.trim());
      setOpen(false);
      setEditing(null);
      setName("");
    }
  };

  const handleEdit = (engineer: Engineer) => {
    setEditing(engineer._id!);
    setName(engineer.name);
    setOpen(true);
  };

  const handleAddNew = () => {
    setEditing(null);
    setName("");
    setOpen(true);
  };

  const filtered = engineers.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Engineers Management</CardTitle>
                <p className="text-sm text-gray-600">
                  Manage engineering team members
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {filtered.length} engineers
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search engineers by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Add Button */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleAddNew}
                  variant={"outline"}
                  className=" text-red-400 flex items-center gap-2  hover:cursor-pointer hover:text-red-600 "
                >
                  <UserPlus className="h-4 w-4" />
                  Add Engineer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-gray-200">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-5 w-5 text-blue-600" />
                    {editing ? "Edit Engineer" : "Add New Engineer"}
                  </DialogTitle>
                  <DialogDescription>
                    {editing
                      ? "Update the engineer name below and click save to apply changes."
                      : "Fill in the engineer name below and click save to add it to database."}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="engineer-name"
                      className="text-sm font-medium"
                    >
                      Engineer Name *
                    </Label>
                    <Input
                      id="engineer-name"
                      placeholder="Enter engineer's full name"
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
                      <Users className="h-4 w-4" />
                      {editing ? "Update Engineer" : "Add Engineer"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Engineers Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <div className="text-xl font-medium text-gray-600 mb-2">
                  {search ? "No engineers found" : "No engineers yet"}
                </div>
                <div className="text-gray-500 max-w-md mx-auto">
                  {search
                    ? `No engineers match "${search}". Try a different search term.`
                    : "Get started by adding your first engineer to the team."}
                </div>
              </div>
              {!search && (
                <Button
                  onClick={handleAddNew}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Your First Engineer
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">
                      Engineer Name
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
                  {filtered.map((engineer) => (
                    <tr
                      key={engineer._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {engineer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {engineer.name}
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
                          className="bg-blue-100 text-blue-800"
                        >
                          Engineer
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(engineer)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeEngineer(engineer._id!)}
                            className="h-8 w-8 p-0 "
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
        </CardContent>
      </Card>
    </div>
  );
}
