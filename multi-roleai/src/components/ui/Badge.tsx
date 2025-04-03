import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background text-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div
        className={cn(badgeVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
