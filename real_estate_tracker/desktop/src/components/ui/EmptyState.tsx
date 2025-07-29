import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../../utils/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  variant?: 'default' | 'compact' | 'centered'
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = 'default',
}) => {
  const containerClasses = cn(
    'flex flex-col items-center text-center',
    {
      'py-12 px-6': variant === 'default',
      'py-8 px-4': variant === 'compact',
      'min-h-[400px] justify-center': variant === 'centered',
    },
    className
  )

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {Icon && (
        <motion.div
          className="mb-4 p-3 rounded-full bg-gray-100 dark:bg-gray-800"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Icon className="h-8 w-8 text-gray-400 dark:text-gray-600" />
        </motion.div>
      )}
      
      <motion.h3
        className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h3>
      
      {description && (
        <motion.p
          className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {description}
        </motion.p>
      )}
      
      {(action || secondaryAction) && (
        <motion.div
          className="flex flex-col sm:flex-row gap-3 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {action && (
            <Button
              onClick={action.onClick}
              leftIcon={action.icon}
              size="md"
            >
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              size="md"
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

// Pre-built empty state variations
export const NoDataEmptyState: React.FC<{
  onAddNew?: () => void
  entityName?: string
}> = ({ onAddNew, entityName = 'item' }) => (
  <EmptyState
    title={`No ${entityName}s yet`}
    description={`Get started by creating your first ${entityName}.`}
    action={
      onAddNew
        ? {
            label: `Add ${entityName}`,
            onClick: onAddNew,
          }
        : undefined
    }
  />
)

export const ErrorEmptyState: React.FC<{
  onRetry?: () => void
  error?: string
}> = ({ onRetry, error }) => (
  <EmptyState
    title="Something went wrong"
    description={error || "We couldn't load the data. Please try again."}
    action={
      onRetry
        ? {
            label: 'Retry',
            onClick: onRetry,
          }
        : undefined
    }
    variant="centered"
  />
)

export const SearchEmptyState: React.FC<{
  searchTerm: string
  onClearSearch?: () => void
}> = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    title="No results found"
    description={`We couldn't find anything matching "${searchTerm}"`}
    action={
      onClearSearch
        ? {
            label: 'Clear search',
            onClick: onClearSearch,
          }
        : undefined
    }
    variant="compact"
  />
)