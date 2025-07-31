// Rooms.tsx - Comprehensive room management page
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Home, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import { TauriService } from "../services/tauri";
import { useDebug } from "../contexts/DebugContext";
import ScrollableSelect from "../components/ui/ScrollableSelect";

interface Room {
  id?: number;
  name: string;
  floor: number;
  length?: number;
  width?: number;
  height?: number;
  condition: number;
  notes?: string;
  projectName?: string;
  projectId: number;
  squareFootage?: number;
}

interface Project {
  id: number;
  name: string;
  roomCount?: number;
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { debugLog } = useDebug();

  const [formData, setFormData] = useState<
    Omit<Room, "id" | "projectName" | "squareFootage">
  >({
    name: "",
    floor: 1,
    length: undefined,
    width: undefined,
    height: 8,
    condition: 3,
    notes: "",
    projectId: 0,
  });

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load rooms when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      loadRooms(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      debugLog("Loading projects for room management");
      const output = await TauriService.getProjects();
      const projectList = parseProjectsFromOutput(output);
      setProjects(projectList);

      if (projectList.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectList[0].id);
      }

      debugLog("Projects loaded", projectList);
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast.error("Failed to load projects");
    }
  };

  const parseProjectsFromOutput = (output: string): Project[] => {
    const lines = output.trim().split("\n");
    const projects: Project[] = [];

    for (const line of lines) {
      if (line.startsWith("│") && line.includes("$")) {
        const columns = line
          .split("│")
          .map((col) => col.trim())
          .filter((col) => col);

        if (columns.length >= 7) {
          const id = parseInt(columns[0], 10);
          const name = columns[1];

          if (!isNaN(id)) {
            projects.push({ id, name });
          }
        }
      }
    }

    return projects;
  };

  const loadRooms = async (projectId: number) => {
    try {
      setIsLoading(true);
      debugLog(`Loading rooms for project ${projectId}`);

      const output = await TauriService.getRooms(projectId);
      const roomList = parseRoomsFromOutput(output, projectId);
      setRooms(roomList);

      debugLog(`Loaded ${roomList.length} rooms`, roomList);
    } catch (error) {
      console.error("Failed to load rooms:", error);
      toast.error("Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  };

  const parseRoomsFromOutput = (output: string, projectId: number): Room[] => {
    const rooms: Room[] = [];
    const lines = output.trim().split("\n");

    for (const line of lines) {
      if (
        line.startsWith("│") &&
        !line.includes("Name") &&
        !line.includes("━")
      ) {
        const columns = line
          .split("│")
          .map((col) => col.trim())
          .filter((col) => col);

        if (columns.length >= 4) {
          const name = columns[0];
          const floor = parseInt(columns[1], 10);
          const sizeStr = columns[2];
          const conditionStr = columns[3];
          const notes = columns[4] || "";

          // Parse condition (e.g., "3/5" -> 3)
          const conditionMatch = conditionStr.match(/(\d+)\/5/);
          const condition = conditionMatch
            ? parseInt(conditionMatch[1], 10)
            : 3;

          // Parse square footage if available
          let squareFootage: number | undefined;
          if (sizeStr !== "Not set") {
            const sqftMatch = sizeStr.match(/(\d+)\s*sq\s*ft/);
            if (sqftMatch) {
              squareFootage = parseInt(sqftMatch[1], 10);
            }
          }

          if (name && !isNaN(floor)) {
            rooms.push({
              name: name.trim(),
              floor,
              condition,
              notes: notes.trim(),
              projectId,
              squareFootage,
            });
          }
        }
      }
    }

    return rooms;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      toast.error("Please select a project first");
      return;
    }

    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error("Room name is required");
      return;
    }

    if (formData.floor === undefined || formData.floor === null) {
      toast.error("Floor number is required");
      return;
    }

    // Validate dimensions if provided
    if (
      (formData.length && !formData.width) ||
      (!formData.length && formData.width)
    ) {
      toast.error("Both length and width must be provided together");
      return;
    }

    try {
      setIsLoading(true);

      if (editingRoom) {
        // Update existing room
        await TauriService.updateRoom(
          selectedProjectId,
          editingRoom.name,
          formData.name,
          formData.length || undefined,
          formData.width || undefined,
          formData.height || undefined,
          formData.condition || 3,
          formData.notes || undefined,
        );
        toast.success("Room updated successfully");
        debugLog("Room updated", formData);
      } else {
        // Add new room
        await TauriService.addRoom(
          selectedProjectId,
          formData.name.trim(),
          formData.floor,
          formData.length || undefined,
          formData.width || undefined,
          formData.height || undefined,
          formData.condition || 3,
          formData.notes?.trim() || undefined,
        );
        toast.success("Room added successfully");
        debugLog("Room added", formData);
      }

      // Reload rooms and close modal
      await loadRooms(selectedProjectId);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save room:", error);
      toast.error(`Failed to ${editingRoom ? "update" : "add"} room: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      floor: room.floor,
      length: room.length,
      width: room.width,
      height: room.height || 8,
      condition: room.condition,
      notes: room.notes || "",
      projectId: room.projectId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (room: Room) => {
    if (
      !window.confirm(
        `Are you sure you want to delete room "${room.name}"? This will also delete all expenses associated with this room.`,
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await TauriService.deleteRoom(room.projectId, room.name);
      toast.success("Room deleted successfully");
      debugLog("Room deleted", room);

      if (selectedProjectId) {
        await loadRooms(selectedProjectId);
      }
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast.error("Failed to delete room");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      floor: 1,
      length: undefined,
      width: undefined,
      height: 8,
      condition: 3,
      notes: "",
      projectId: selectedProjectId || 0,
    });
    setEditingRoom(null);
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1114]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Room Management
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  selectedProjectId && loadRooms(selectedProjectId)
                }
                disabled={isLoading || !selectedProjectId}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </button>

              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                disabled={!selectedProjectId}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Room
              </button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            Manage rooms across your renovation projects
          </p>
        </div>

        {/* Project Selection & Search */}
        <div className="bg-white dark:bg-[#131619] border border-gray-200 dark:border-black rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="min-w-64">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Project:
                </label>
                <ScrollableSelect
                  value={selectedProjectId?.toString() || ""}
                  onChange={(value) =>
                    setSelectedProjectId(parseInt(value, 10))
                  }
                  options={projects.map((project) => ({
                    value: project.id.toString(),
                    label: `#${project.id} - ${project.name}`,
                    description: `Project ID: ${project.id}`,
                  }))}
                  placeholder="Select a project..."
                  disabled={projects.length === 0}
                  searchable={true}
                  className="w-full"
                />
              </div>

              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Rooms:
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by room name or notes..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-black rounded-md bg-white dark:bg-[#0f1114] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedProject && (
                <>
                  <span className="font-medium">{selectedProject.name}</span>
                  <br />
                  <span>
                    {filteredRooms.length} room
                    {filteredRooms.length !== 1 ? "s" : ""} found
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rooms Content */}
        {!selectedProjectId ? (
          <div className="bg-white dark:bg-[#131619] rounded-lg border border-gray-200 dark:border-black p-12 text-center">
            <Home className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Select a Project
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Choose a project from the dropdown above to view and manage its
              rooms.
            </p>
          </div>
        ) : isLoading ? (
          <div className="bg-white dark:bg-[#131619] rounded-lg border border-gray-200 dark:border-black p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                Loading rooms...
              </span>
            </div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-white dark:bg-[#131619] rounded-lg border border-gray-200 dark:border-black p-12 text-center">
            <Home className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? "No rooms match your search" : "No rooms found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm
                ? "Try adjusting your search terms or add a new room."
                : `Add your first room to ${selectedProject?.name || "this project"}.`}
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Your First Room
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#131619] rounded-lg border border-gray-200 dark:border-black overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#0f1114] border-b border-gray-200 dark:border-black">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Room Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Floor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#131619] divide-y divide-gray-200 dark:divide-black">
                  {filteredRooms.map((room, index) => (
                    <tr
                      key={`${room.projectId}-${room.name}`}
                      className={`hover:bg-gray-50 dark:hover:bg-[#171b1f] transition-colors ${
                        index !== filteredRooms.length - 1
                          ? "border-b border-gray-200 dark:border-black"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {room.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          Floor {room.floor}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {room.squareFootage
                            ? `${room.squareFootage} sq ft`
                            : "Not set"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            room.condition >= 4
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : room.condition >= 3
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {room.condition}/5
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-32 truncate">
                          {room.notes || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(room)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Edit room"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(room)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Delete room"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Room Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#131619] rounded-lg border border-gray-200 dark:border-black shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {editingRoom ? "Edit Room" : "Add New Room"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Room Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Living Room, Kitchen, Bedroom"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-black rounded-md bg-white dark:bg-[#0f1114] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Floor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Floor *{" "}
                      <span className="text-xs text-gray-500">(Required)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.floor || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          floor: parseInt(e.target.value) || 0,
                        }))
                      }
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-black rounded-md bg-white dark:bg-[#0f1114] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Room Dimensions */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Length (ft)
                      </label>
                      <input
                        type="number"
                        value={formData.length || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            length: parseFloat(e.target.value) || undefined,
                          }))
                        }
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-black rounded-md bg-white dark:bg-[#0f1114] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Width (ft)
                      </label>
                      <input
                        type="number"
                        value={formData.width || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            width: parseFloat(e.target.value) || undefined,
                          }))
                        }
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-black rounded-md bg-white dark:bg-[#0f1114] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Height (ft)
                      </label>
                      <input
                        type="number"
                        value={formData.height || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            height: parseFloat(e.target.value) || undefined,
                          }))
                        }
                        min="0"
                        step="0.1"
                        placeholder="8.0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-black rounded-md bg-white dark:bg-[#0f1114] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Initial Condition
                    </label>
                    <select
                      value={formData.condition || 3}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          condition: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-black rounded-md bg-white dark:bg-[#0f1114] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>1 - Poor</option>
                      <option value={2}>2 - Fair</option>
                      <option value={3}>3 - Average</option>
                      <option value={4}>4 - Good</option>
                      <option value={5}>5 - Excellent</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Optional notes about the room..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-black rounded-md bg-white dark:bg-[#0f1114] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#0f1114] hover:bg-gray-200 dark:hover:bg-[#171b1f] border border-gray-300 dark:border-black rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      {editingRoom ? "Update Room" : "Add Room"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
