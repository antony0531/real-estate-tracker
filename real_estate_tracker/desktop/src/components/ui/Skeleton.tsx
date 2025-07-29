import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'text',
      width,
      height,
      animation = 'pulse',
      style,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      'bg-gray-200 dark:bg-gray-800',
      {
        'rounded-md': variant === 'text',
        'rounded-full': variant === 'circular',
        'rounded-lg': variant === 'rectangular',
      },
      className
    )

    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 bg-[length:200%_100%]',
      none: '',
    }

    const dimensions = {
      width: width || (variant === 'circular' ? 40 : '100%'),
      height:
        height ||
        (variant === 'text' ? 20 : variant === 'circular' ? 40 : 120),
    }

    return (
      <div
        ref={ref}
        className={cn(baseClasses, animationClasses[animation])}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          ...style,
        }}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

// Skeleton container for multiple skeleton items
interface SkeletonContainerProps {
  children: React.ReactNode
  className?: string
  show?: boolean
}

export const SkeletonContainer: React.FC<SkeletonContainerProps> = ({
  children,
  className,
  show = true,
}) => {
  if (!show) return <>{children}</>

  return (
    <motion.div
      className={cn('space-y-3', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Pre-built skeleton templates
export const SkeletonCard: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn('p-6 space-y-4', className)}>
    <div className="space-y-2">
      <Skeleton variant="text" width="60%" height={28} />
      <Skeleton variant="text" width="80%" height={16} />
    </div>
    <Skeleton variant="rectangular" height={200} />
    <div className="flex gap-2">
      <Skeleton variant="text" width={80} height={32} />
      <Skeleton variant="text" width={80} height={32} />
    </div>
  </div>
)

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({
  rows = 5,
  className,
}) => (
  <div className={cn('space-y-2', className)}>
    <div className="flex gap-4 p-4 border-b">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} variant="text" width={`${25 - i * 2}%`} height={20} />
      ))}
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4 p-4">
        {[...Array(4)].map((_, j) => (
          <Skeleton
            key={j}
            variant="text"
            width={`${25 - j * 2}%`}
            height={16}
          />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonAvatar: React.FC<{
  size?: number
  className?: string
}> = ({ size = 40, className }) => (
  <Skeleton
    variant="circular"
    width={size}
    height={size}
    className={className}
  />
)

export const SkeletonButton: React.FC<{
  width?: string | number
  className?: string
}> = ({ width = 100, className }) => (
  <Skeleton
    variant="rectangular"
    width={width}
    height={40}
    className={cn('rounded-lg', className)}
  />
)

export { Skeleton }