// MultiSelect.tsx - Modern multi-select dropdown with search and tags

import React, { useState, useRef, useEffect } from 'react'

interface Option {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface MultiSelectProps {
  options: Option[]
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  searchable?: boolean
  maxHeight?: string
  className?: string
  error?: string
  maxSelected?: number
}

export default function MultiSelect({
  options,
  values,
  onChange,
  placeholder = "Select options",
  label,
  required = false,
  disabled = false,
  searchable = true,
  maxHeight = "200px",
  className = "",
  error,
  maxSelected
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Get selected options
  const selectedOptions = options.filter(option => values.includes(option.value))

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  const handleToggleOption = (optionValue: string) => {
    if (values.includes(optionValue)) {
      // Remove from selection
      onChange(values.filter(v => v !== optionValue))
    } else {
      // Add to selection (if not at max limit)
      if (!maxSelected || values.length < maxSelected) {
        onChange([...values, optionValue])
      }
    }
  }

  const handleRemoveOption = (optionValue: string) => {
    onChange(values.filter(v => v !== optionValue))
  }

  const handleClearAll = () => {
    onChange([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
        setHighlightedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
        break
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const selectedOption = filteredOptions[highlightedIndex]
          if (!selectedOption.disabled) {
            handleToggleOption(selectedOption.value)
          }
        }
        break
    }
  }

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div ref={dropdownRef} className="relative">
        {/* Select Button */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`
            w-full input text-left cursor-pointer min-h-[42px] flex flex-wrap items-center gap-1 p-2
            ${error ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          tabIndex={disabled ? -1 : 0}
        >
          {/* Selected Tags */}
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-md"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveOption(option.value)
                    }}
                    className="hover:text-blue-600 dark:hover:text-blue-200"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-500 dark:text-slate-400 flex-1">
              {placeholder}
            </span>
          )}

          {/* Controls */}
          <div className="flex items-center gap-1">
            {selectedOptions.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClearAll()
                }}
                className="p-1 hover:text-gray-600 dark:hover:text-slate-300 text-gray-400"
                title="Clear all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg">
            {/* Search Input */}
            {searchable && (
              <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-md bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-50 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            )}

            {/* Header with count */}
            <div className="p-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400">
                <span>{selectedOptions.length} selected</span>
                {maxSelected && (
                  <span>Max: {maxSelected}</span>
                )}
              </div>
            </div>

            {/* Options */}
            <div
              className="max-h-60 overflow-y-auto py-1"
              style={{ maxHeight }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-slate-400 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = values.includes(option.value)
                  const isDisabled = option.disabled || (maxSelected && !isSelected && values.length >= maxSelected)
                  
                  return (
                    <div
                      key={option.value}
                      onClick={() => !isDisabled && handleToggleOption(option.value)}
                      className={`
                        px-3 py-2 cursor-pointer transition-colors text-sm flex items-center gap-2
                        ${isDisabled
                          ? 'text-gray-400 dark:text-slate-600 cursor-not-allowed' 
                          : 'text-gray-900 dark:text-slate-50 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }
                        ${index === highlightedIndex ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      `}
                    >
                      {/* Checkbox */}
                      <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                        isSelected 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300 dark:border-slate-600'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
          {error}
        </p>
      )}
    </div>
  )
} 