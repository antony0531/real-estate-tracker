// Input validation utilities for security

export const sanitizeInput = (input: string): string => {
  // Remove any HTML tags and script injections
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateBudgetAmount = (amount: string): {
  isValid: boolean;
  sanitized: number | null;
  error?: string;
} => {
  // Remove any non-numeric characters except decimal point
  const sanitized = amount.replace(/[^0-9.]/g, '');
  
  // Check if it's a valid number
  const parsed = parseFloat(sanitized);
  
  if (isNaN(parsed)) {
    return {
      isValid: false,
      sanitized: null,
      error: 'Please enter a valid number'
    };
  }
  
  if (parsed < 0) {
    return {
      isValid: false,
      sanitized: null,
      error: 'Amount cannot be negative'
    };
  }
  
  if (parsed > 10000000) {
    return {
      isValid: false,
      sanitized: null,
      error: 'Amount exceeds maximum limit'
    };
  }
  
  // Round to 2 decimal places
  const rounded = Math.round(parsed * 100) / 100;
  
  return {
    isValid: true,
    sanitized: rounded
  };
};

export const validateProjectName = (name: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} => {
  const sanitized = sanitizeInput(name);
  
  if (sanitized.length < 2) {
    return {
      isValid: false,
      sanitized,
      error: 'Project name must be at least 2 characters'
    };
  }
  
  if (sanitized.length > 100) {
    return {
      isValid: false,
      sanitized: sanitized.substring(0, 100),
      error: 'Project name must be less than 100 characters'
    };
  }
  
  return {
    isValid: true,
    sanitized
  };
};

export const validateDate = (date: string): {
  isValid: boolean;
  error?: string;
} => {
  const parsed = new Date(date);
  
  if (isNaN(parsed.getTime())) {
    return {
      isValid: false,
      error: 'Please enter a valid date'
    };
  }
  
  // Check if date is not too far in the past (e.g., more than 10 years)
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  
  if (parsed < tenYearsAgo) {
    return {
      isValid: false,
      error: 'Date is too far in the past'
    };
  }
  
  // Check if date is not too far in the future (e.g., more than 10 years)
  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
  
  if (parsed > tenYearsFromNow) {
    return {
      isValid: false,
      error: 'Date is too far in the future'
    };
  }
  
  return {
    isValid: true
  };
};