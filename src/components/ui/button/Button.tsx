// components/Button.tsx
import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  fullWidth = false,
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500 focus:ring-offset-gray-900 shadow-lg hover:shadow-purple-500/25",
    secondary: "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 focus:ring-gray-500 focus:ring-offset-gray-900 shadow-lg hover:shadow-gray-500/25",
    outline: "border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white focus:ring-purple-500 focus:ring-offset-gray-900 backdrop-blur-sm",
    ghost: "text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 focus:ring-purple-500 focus:ring-offset-gray-900",
    danger: "bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 focus:ring-red-500 focus:ring-offset-gray-900 shadow-lg hover:shadow-red-500/25"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm",
    lg: "px-6 py-3.5 text-base",
    xl: "px-8 py-4 text-lg"
  };

  const widthClass = fullWidth ? "w-full" : "";

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classes}
    >
      {loading ? (
        <span className="flex items-center justify-center space-x-2">
          <Spinner size={size} />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

// Spinner Component for Loading States
const Spinner: React.FC<{ size: ButtonProps['size'] }> = ({ size }) => {
  const spinnerSizes = {
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6"
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${spinnerSizes[size || "sm"]}`} />
  );
};