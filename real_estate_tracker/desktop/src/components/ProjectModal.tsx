import { useState } from "react";
import { toast } from "sonner";
import { TauriService, type ProjectData } from "../services/tauri";
import ScrollableSelect from "./ui/ScrollableSelect";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: ProjectData | null;
}

export default function ProjectModal({
  isOpen,
  onClose,
  onSuccess,
  project,
}: ProjectModalProps) {
  const [formData, setFormData] = useState<ProjectData>({
    name: project?.name || "",
    budget: project?.budget || 100000,
    property_type: project?.property_type || "single_family",
    property_class: project?.property_class || "sf_class_c",
    description: project?.description || "",
    sqft: project?.sqft || undefined,
    address: project?.address || "",
    floors: project?.floors || undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (project) {
        // Update existing project (not implemented yet)
        toast.info("Project editing coming soon!");
      } else {
        // Create new project
        await TauriService.createProject(formData);
        toast.success("Project created successfully!");
        onSuccess();
        onClose();

        // Reset form
        setFormData({
          name: "",
          budget: 100000,
          property_type: "single_family",
          property_class: "sf_class_c",
          description: "",
          sqft: undefined,
          address: "",
          floors: undefined,
        });
      }
    } catch (error) {
      toast.error(
        `Failed to create project: ${TauriService.handleError(error)}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let newValue: any = value;

      // Handle number conversions
      if (name === "budget" || name === "sqft" || name === "floors") {
        newValue = value === "" ? undefined : Number(value);
      }

      const updated = { ...prev, [name]: newValue };

      // Auto-update property_class when property_type changes
      if (name === "property_type") {
        if (value === "single_family") {
          updated.property_class = "sf_class_c"; // Default to mid-range
        } else if (value === "multifamily") {
          updated.property_class = "mf_class_b"; // Default to standard
        }
      }

      return updated;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {project ? "Edit Project" : "Create New Project"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="e.g., Ridgefield House Flip"
            />
          </div>

          {/* Budget */}
          <div>
            <label
              htmlFor="budget"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Total Budget *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">
                $
              </span>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                required
                min="1000"
                step="1000"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="150000"
              />
            </div>
          </div>

          {/* Property Type and Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ScrollableSelect
                label="Property Type *"
                value={formData.property_type}
                onChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    property_type: value,
                    // Reset property class when type changes
                    property_class:
                      value === "single_family" ? "sf_class_c" : "mf_class_b",
                  }));
                }}
                options={[
                  {
                    value: "single_family",
                    label: "Single Family",
                    description: "Single-family residential properties",
                  },
                  {
                    value: "multifamily",
                    label: "Multifamily",
                    description: "Multi-unit residential properties",
                  },
                ]}
                placeholder="Select property type"
                required
                searchable={false}
                maxHeight="200px"
              />
            </div>

            <div>
              <ScrollableSelect
                label="Property Class *"
                value={formData.property_class}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, property_class: value }))
                }
                options={
                  formData.property_type === "single_family"
                    ? [
                        {
                          value: "sf_class_a",
                          label: "Class A - Ultra-Luxury",
                          description: "$2.5-4M property value",
                        },
                        {
                          value: "sf_class_b",
                          label: "Class B - Luxury",
                          description: "$1-2M property value",
                        },
                        {
                          value: "sf_class_c",
                          label: "Class C - Mid-Range",
                          description: "$700K-999K property value",
                        },
                        {
                          value: "sf_class_d",
                          label: "Class D - Budget",
                          description: "<$550K property value",
                        },
                      ]
                    : [
                        {
                          value: "mf_class_a",
                          label: "Class A - Premium",
                          description: "$1-1.5M property value",
                        },
                        {
                          value: "mf_class_b",
                          label: "Class B - Standard",
                          description: "$750K-900K property value",
                        },
                        {
                          value: "mf_class_c",
                          label: "Class C - Value",
                          description: "$500K-749K property value",
                        },
                      ]
                }
                placeholder="Select property class"
                required
                searchable={false}
                maxHeight="250px"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Property Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="123 Main Street, City, State 12345"
            />
          </div>

          {/* Square Footage and Floors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sqft"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Square Footage
              </label>
              <input
                type="number"
                id="sqft"
                name="sqft"
                value={formData.sqft || ""}
                onChange={handleInputChange}
                min="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="2000"
              />
            </div>

            <div>
              <ScrollableSelect
                label="Number of Floors"
                value={formData.floors?.toString() || ""}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    floors: value ? parseInt(value) : undefined,
                  }))
                }
                options={[
                  {
                    value: "",
                    label: "Not specified",
                    description: "Floor count unknown",
                  },
                  {
                    value: "1",
                    label: "1 Floor",
                    description: "Single story property",
                  },
                  {
                    value: "2",
                    label: "2 Floors",
                    description: "Two story property",
                  },
                  {
                    value: "3",
                    label: "3 Floors",
                    description: "Three story property",
                  },
                  {
                    value: "4",
                    label: "4+ Floors",
                    description: "Multi-story property",
                  },
                ]}
                placeholder="Select floors"
                searchable={false}
                maxHeight="200px"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Project Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Describe your renovation plans, target market, etc."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.budget}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Creating..."
                : project
                  ? "Update Project"
                  : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
