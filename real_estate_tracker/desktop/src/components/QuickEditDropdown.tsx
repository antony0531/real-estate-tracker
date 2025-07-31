// QuickEditDropdown.tsx - Inline quick edit dropdown for status and priority

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface QuickEditOption {
  value: string;
  label: string;
  color?: string;
}

interface QuickEditDropdownProps {
  currentValue: string;
  options: QuickEditOption[];
  onSave: (value: string) => Promise<void>;
  type: "status" | "priority";
  disabled?: boolean;
}

export default function QuickEditDropdown({
  currentValue,
  options,
  onSave,
  type,
  disabled = false,
}: QuickEditDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setSaving] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updatePosition() {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        });
      }
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOption =
    options.find((opt) => opt.value === currentValue) || options[0];

  const handleOptionSelect = async (value: string) => {
    if (value === currentValue || isLoading) return;

    try {
      setSaving(true);
      await onSave(value);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (option: QuickEditOption) => {
    if (type === "priority") {
      switch (option.value) {
        case "urgent":
          return "🔴";
        case "high":
          return "🟠";
        case "medium":
          return "🟡";
        case "low":
          return "🟢";
        default:
          return "⚪";
      }
    } else {
      switch (option.value) {
        case "planning":
          return "📋";
        case "in_progress":
          return "🔄";
        case "completed":
          return "✅";
        case "on_hold":
          return "⏸️";
        default:
          return "❓";
      }
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          type === "priority"
            ? getPriorityStyles(currentValue)
            : getStatusStyles(currentValue)
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className="text-base">{getIcon(currentOption)}</span>
        {currentOption.label}
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              zIndex: 9999,
            }}
            className="fixed w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 py-1"
          >
            <div className="px-3 py-2 border-b border-gray-200 dark:border-slate-700">
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                {type === "status" ? "Project Status" : "Priority Level"}
              </p>
            </div>

            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                disabled={isLoading || option.value === currentValue}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  option.value === currentValue
                    ? "bg-gray-100 dark:bg-slate-700 cursor-default"
                    : "hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                } ${isLoading ? "opacity-50" : ""}`}
              >
                <span className="text-base">{getIcon(option)}</span>
                <span className="flex-1 text-left font-medium text-gray-900 dark:text-slate-50">
                  {option.label}
                </span>
                {option.value === currentValue && (
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>,
          document.body,
        )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full opacity-75">
          <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

// Helper functions for styling
function getPriorityStyles(priority: string): string {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50";
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900/50";
  }
}

function getStatusStyles(status: string): string {
  switch (status) {
    case "planning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50";
    case "in_progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50";
    case "on_hold":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900/50";
  }
}

// Predefined options for common use cases
export const STATUS_OPTIONS: QuickEditOption[] = [
  { value: "planning", label: "Planning", color: "yellow" },
  { value: "in_progress", label: "In Progress", color: "blue" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "on_hold", label: "On Hold", color: "red" },
];

export const PRIORITY_OPTIONS: QuickEditOption[] = [
  { value: "urgent", label: "Urgent", color: "red" },
  { value: "high", label: "High", color: "orange" },
  { value: "medium", label: "Medium", color: "yellow" },
  { value: "low", label: "Low", color: "green" },
];
