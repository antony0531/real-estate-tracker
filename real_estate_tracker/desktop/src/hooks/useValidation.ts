// useValidation.ts - Comprehensive validation hook for real-time form validation

import { useState, useCallback } from 'react'

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any, formData?: any) => string | null
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule
}

export interface FieldValidation {
  isValid: boolean
  error?: string
  warning?: string
  suggestion?: string
}

export interface ValidationState {
  [fieldName: string]: FieldValidation
}

export interface UseValidationProps {
  rules: ValidationRules
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export const useValidation = ({ 
  rules, 
  validateOnChange = true, 
  validateOnBlur = true 
}: UseValidationProps) => {
  const [validationState, setValidationState] = useState<ValidationState>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = useCallback((
    fieldName: string, 
    value: any, 
    formData?: any
  ): FieldValidation => {
    const rule = rules[fieldName]
    if (!rule) return { isValid: true }

    let error: string | null = null
    let warning: string | null = null
    let suggestion: string | null = null

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      error = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
    }

    // String length validation
    if (value && typeof value === 'string' && !error) {
      if (rule.minLength && value.trim().length < rule.minLength) {
        error = `Must be at least ${rule.minLength} characters`
      }
      if (rule.maxLength && value.trim().length > rule.maxLength) {
        error = `Must be no more than ${rule.maxLength} characters`
      }
    }

    // Number range validation
    if (value && typeof value === 'number' && !error) {
      if (rule.min !== undefined && value < rule.min) {
        error = `Must be at least ${rule.min}`
      }
      if (rule.max !== undefined && value > rule.max) {
        error = `Must be no more than ${rule.max}`
      }
    }

    // Pattern validation
    if (value && rule.pattern && typeof value === 'string' && !error) {
      if (!rule.pattern.test(value)) {
        error = 'Invalid format'
      }
    }

    // Custom validation
    if (rule.custom && !error) {
      const customResult = rule.custom(value, formData)
      if (customResult) {
        error = customResult
      }
    }

    // Field-specific validation and suggestions
    if (!error) {
      switch (fieldName) {
        case 'cost':
          if (typeof value === 'number' && value > 100000) {
            warning = 'Large expense - double check amount'
          }
          if (typeof value === 'number' && value > 0 && value < 1) {
            suggestion = 'Consider rounding to nearest dollar'
          }
          break
        case 'roomName':
          if (typeof value === 'string' && value.toLowerCase().includes('bath')) {
            suggestion = 'Common room names: "Master Bathroom", "Guest Bathroom"'
          }
          break
        case 'budget':
          if (typeof value === 'number' && value < 10000) {
            warning = 'Low budget - ensure it covers planned work'
          }
          break
      }
    }

    return {
      isValid: !error,
      error: error || undefined,
      warning: warning || undefined,
      suggestion: suggestion || undefined
    }
  }, [rules])

  const validateForm = useCallback((formData: any): boolean => {
    const newValidationState: ValidationState = {}
    let isFormValid = true

    Object.keys(rules).forEach(fieldName => {
      const validation = validateField(fieldName, formData[fieldName], formData)
      newValidationState[fieldName] = validation
      if (!validation.isValid) {
        isFormValid = false
      }
    })

    setValidationState(newValidationState)
    return isFormValid
  }, [rules, validateField])

  const handleFieldChange = useCallback((fieldName: string, value: any, formData?: any) => {
    if (validateOnChange || touched[fieldName]) {
      const validation = validateField(fieldName, value, formData)
      setValidationState(prev => ({
        ...prev,
        [fieldName]: validation
      }))
    }
  }, [validateField, validateOnChange, touched])

  const handleFieldBlur = useCallback((fieldName: string, value: any, formData?: any) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    
    if (validateOnBlur) {
      const validation = validateField(fieldName, value, formData)
      setValidationState(prev => ({
        ...prev,
        [fieldName]: validation
      }))
    }
  }, [validateField, validateOnBlur])

  const clearFieldValidation = useCallback((fieldName: string) => {
    setValidationState(prev => {
      const newState = { ...prev }
      delete newState[fieldName]
      return newState
    })
    setTouched(prev => {
      const newTouched = { ...prev }
      delete newTouched[fieldName]
      return newTouched
    })
  }, [])

  const clearAllValidation = useCallback(() => {
    setValidationState({})
    setTouched({})
  }, [])

  const isFormValid = Object.values(validationState).every(v => v.isValid)
  const hasErrors = Object.values(validationState).some(v => v.error)
  const hasWarnings = Object.values(validationState).some(v => v.warning)

  return {
    validationState,
    validateField,
    validateForm,
    handleFieldChange,
    handleFieldBlur,
    clearFieldValidation,
    clearAllValidation,
    isFormValid,
    hasErrors,
    hasWarnings,
    touched
  }
} 