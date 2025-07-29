// ScrollableSelect.tsx - Modern scrollable dropdown with search

import React, { useState, useRef, useEffect } from 'react'

interface Option {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface ScrollableSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  searchable?: boolean
  maxHeight?: string
  className?: string
  error?: string
}

export default function ScrollableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  required = false,
  disabled = false,
  searchable = true,
  maxHeight = "200px",
  className = "",
  error
}: ScrollableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const optionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Find selected option
  const selectedOption = options.find(option => option.value === value)

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

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [highlightedIndex])

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
            onChange(selectedOption.value)
            setIsOpen(false)
            setSearchTerm('')
            setHighlightedIndex(-1)
          }
        }
        break
    }
  }

  const handleOptionClick = (option: Option) => {
    if (!option.disabled) {
      onChange(option.value)
      setIsOpen(false)
      setSearchTerm('')
      setHighlightedIndex(-1)
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
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            w-full input text-left flex items-center justify-between
            ${error ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className={selectedOption ? 'text-gray-900 dark:text-slate-50' : 'text-gray-500 dark:text-slate-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
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
        </button>

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
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    ref={el => optionRefs.current[index] = el}
                    onClick={() => handleOptionClick(option)}
                    className={`
                      px-3 py-2 cursor-pointer transition-colors text-sm
                      ${option.disabled 
                        ? 'text-gray-400 dark:text-slate-600 cursor-not-allowed' 
                        : 'text-gray-900 dark:text-slate-50 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }
                      ${index === highlightedIndex ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                      ${option.value === value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}
                    `}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {option.description}
                      </div>
                    )}
                  </div>
                ))
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