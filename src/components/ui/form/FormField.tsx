// components/FormField.tsx
import React from 'react';
import type { FormFieldProps } from '../../../types/form';



export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  onBlur,
  required = false,
  placeholder,
  disabled = false,
  error,
  touched = false,
  showSuccess = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
}) => {
  const getInputClasses = () => {
    const baseClasses = "w-full px-4 py-3 bg-gray-900/60 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-offset-1 transition-all duration-200 outline-none placeholder-gray-500 text-white";

    if (disabled) {
      return `${baseClasses} border-gray-600/30 bg-gray-800/40 text-gray-400 cursor-not-allowed`;
    }

    if (error && touched) {
      return `${baseClasses} border-red-500/50 focus:border-red-400 focus:ring-red-500/30`;
    }

    if (showSuccess && touched && !error && value) {
      return `${baseClasses} border-green-500/50 focus:border-green-400 focus:ring-green-500/30`;
    }

    return `${baseClasses} border-gray-600/50 focus:border-purple-400 focus:ring-purple-500/30`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Error */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className={`block text-sm font-medium transition-colors duration-200 ${error && touched
              ? 'text-red-400'
              : showSuccess && touched && !error && value
                ? 'text-green-400'
                : 'text-gray-300'
            } ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>

        {error && touched && (
          <span className="text-xs text-red-400 font-medium flex items-center space-x-1">
            <span>⚠</span>
            <span>{error}</span>
          </span>
        )}
      </div>

      {/* Input Container */}
      <div className="relative">
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className={`${getInputClasses()} ${inputClassName}`}
        />

        {/* Success Indicator */}
        {showSuccess && touched && !error && value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="text-green-400 text-lg">✓</span>
          </div>
        )}

        {/* Error Indicator */}
        {error && touched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="text-red-400 text-lg">⚠</span>
          </div>
        )}
      </div>
    </div>
  );
};