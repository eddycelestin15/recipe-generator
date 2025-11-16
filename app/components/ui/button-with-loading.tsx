import { forwardRef } from 'react';
import { Button, ButtonProps } from './button';
import { Spinner } from './spinner';
import { cn } from '@/lib/utils';

interface ButtonWithLoadingProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const ButtonWithLoading = forwardRef<HTMLButtonElement, ButtonWithLoadingProps>(
  ({ loading = false, loadingText, children, disabled, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn('relative', className)}
        {...props}
      >
        {loading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </span>
        )}
        <span className={cn(loading && 'opacity-0')}>
          {loading && loadingText ? loadingText : children}
        </span>
      </Button>
    );
  }
);

ButtonWithLoading.displayName = 'ButtonWithLoading';
