// ValidatedField.tsx - Reusable form field with validation feedback

import React from 'react'
import { FieldValidation } from '../../hooks/useValidation'

interface ValidatedFieldProps {
  label: string
  fieldName: string
  value: any
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  validation?: FieldValidation
  required?: boolean
  type?: 'text' | 'number' | 'select' | 'textarea'
  placeholder?: string
  options?: Array<{ value: string | number; label: string }>
  disabled?: boolean
  className?: string
  min?: number
  max?: number
  step?: number
  rows?: number
  children?: React.ReactNode
}

export default function ValidatedField({
  label,
  fieldName,
  value,
  onChange,
  onBlur,
  validation,
  required = false,
  type = 'text',
  placeholder,
  options,
  disabled = false,
  className = '',
  min,
  max,
  step,
  rows = 3,
  children
}: ValidatedFieldProps) {
  const hasError = validation?.error
  const hasWarning = validation?.warning && !hasError
  const hasSuggestion = validation?.suggestion && !hasError && !hasWarning

  const getFieldClasses = () => {
    const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-gray-100 transition-colors"
    
    if (hasError) {
      return `${baseClasses} border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20`
    }
    if (hasWarning) {
      return `${baseClasses} border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20`
    }
    if (validation?.isValid && validation?.isValid !== undefined) {
      return `${baseClasses} border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50 dark:bg-green-900/20`
    }
    
    return `${baseClasses} border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 ${className}`
  }

  const renderField = () => {
    const commonProps = {
      id: fieldName,
      name: fieldName,
      value: type === 'number' && value === 0 ? '' : value,
      onChange,
      onBlur,
      disabled,
      className: getFieldClasses(),
      required
    }

    switch (type) {
      case 'select':
        return (
          <select {...commonProps}>
            {children}
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            placeholder={placeholder}
          />
        )
      
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
          />
        )
      
      default:
        return (
          <input
            {...commonProps}
            type={type}
            placeholder={placeholder}
          />
        )
    }
  }

  return (
    <div className="space-y-1">
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {renderField()}
      
      {/* Validation Messages */}
      {hasError && (
        <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {validation.error}
        </div>
      )}
      
      {hasWarning && (
        <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {validation.warning}
        </div>
      )}
      
      {hasSuggestion && (
        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {validation.suggestion}
        </div>
      )}
    </div>
  )
} 