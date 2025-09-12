'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Toaster as SonnerToaster,
  toast as sonnerToast,
} from 'sonner';
import {
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const variantStyles = {
  default: 'bg-white border-gray-200 text-gray-900',
  success: 'bg-white border-green-600/50',
  error: 'bg-white border-red-600/50',
  warning: 'bg-white border-amber-600/50',
};

const titleColor = {
  default: 'text-gray-900',
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-amber-600',
};

const iconColor = {
  default: 'text-gray-500',
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-amber-600',
};

const variantIcons = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
};

const toastAnimation = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 50, scale: 0.95 },
};

const Toaster = forwardRef(({ defaultPosition = 'top-right' }, ref) => {
  const toastReference = useRef(null);

  useImperativeHandle(ref, () => ({
    show({
      title,
      message,
      variant = 'default',
      duration = 4000,
      position = defaultPosition,
      actions,
      onDismiss,
      highlightTitle,
    }) {
      const Icon = variantIcons[variant];

      toastReference.current = sonnerToast.custom(
        (toastId) => (
          <motion.div
            variants={toastAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'flex items-center justify-between w-full max-w-xs p-3 rounded-xl border shadow-md',
              variantStyles[variant]
            )}
          >
            <div className="flex items-start gap-2">
              <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', iconColor[variant])} />
              <div className="space-y-0.5">
                {title && (
                  <h3
                    className={cn(
                      'text-xs font-medium leading-none',
                      titleColor[variant],
                      highlightTitle && titleColor['success']
                    )}
                  >
                    {title}
                  </h3>
                )}
                <p className="text-xs text-gray-600">{message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {actions?.label && (
                <Button
                  variant={actions.variant || 'outline'}
                  size="sm"
                  onClick={() => {
                    actions.onClick();
                    sonnerToast.dismiss(toastId);
                  }}
                  className={cn(
                    'cursor-pointer',
                    variant === 'success'
                      ? 'text-green-600 border-green-600 hover:bg-green-600/10'
                      : variant === 'error'
                      ? 'text-red-600 border-red-600 hover:bg-red-600/10'
                      : variant === 'warning'
                      ? 'text-amber-600 border-amber-600 hover:bg-amber-600/10'
                      : 'text-gray-900 border-gray-300 hover:bg-gray-100'
                  )}
                >
                  {actions.label}
                </Button>
              )}

              <button
                onClick={() => {
                  sonnerToast.dismiss(toastId);
                  onDismiss?.();
                }}
                className="rounded-full p-1 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Dismiss notification"
              >
                <X className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          </motion.div>
        ),
        { duration, position }
      );
    },
  }));

  return (
    <SonnerToaster
      position={defaultPosition}
      toastOptions={{ unstyled: true, className: 'flex justify-end' }}
    />
  );
});

export default Toaster;
