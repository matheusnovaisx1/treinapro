import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        accent: 'border-transparent bg-accent text-accent-foreground shadow-[0_2px_0_0_hsl(var(--accent-shadow))]',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        success: 'border-transparent bg-success text-success-foreground shadow-[0_2px_0_0_hsl(var(--success-shadow))]',
        gold: 'border-transparent bg-gold text-gold-foreground shadow-[0_2px_0_0_hsl(var(--gold-shadow))]',
        fire: 'border-transparent text-white shadow-[0_2px_0_0_hsl(var(--fire-end-shadow))] bg-gradient-to-r from-accent to-[hsl(var(--fire-end))]',
        outline: 'text-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
