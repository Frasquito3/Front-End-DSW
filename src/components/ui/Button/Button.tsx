import type React from 'react';
import { cn } from '../../../lib/utils';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Button component.
 * @interface ButtonProps
 * @extends React.ButtonHTMLAttributes<HTMLButtonElement>
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The content to be displayed inside the button. */
  children: React.ReactNode;
  /**
   * If true, the button will be disabled and a loading spinner will be displayed.
   * @default false
   */
  isLoading?: boolean;
  /**
   * The visual style of the button.
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * The size of the button.
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * If true, the button will occupy the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Accessible label for buttons that contain only icons.
   * Essential for screen readers when no text is visible.
   */
  'aria-label'?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  outline:
    'bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
  destructive: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-1.5 px-3 text-sm',
  md: 'py-2.5 px-4 text-base',
  lg: 'py-3 px-6 text-lg',
};

/**
 * A versatile and reusable button component, foundational to the UI.
 * It supports different visual styles (variants), sizes, and a loading state.
 * Built with accessibility and professional standards in mind, using the `cn` utility
 * for flexible class name composition.
 *
 * @param {ButtonProps} props - The properties to configure the button.
 * @returns {JSX.Element} The rendered button component.
 * @example
 * <Button variant="primary" size="lg" onClick={() => alert('Clicked!')} aria-label="Submit Form">
 *   Click Me
 * </Button>
 */
const Button = ({
  children,
  isLoading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        { 'w-full': fullWidth },
        className
      )}
      disabled={isLoading || props.disabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin h-5 w-5 border-2 border-transparent border-t-current rounded-full" aria-hidden="true"></span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;