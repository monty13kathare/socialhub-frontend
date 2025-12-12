import type { FormFieldProps } from '../../../types/form';
import { FormField } from './FormField';

// components/form-fields/index.tsx
export { FormField } from './FormField';

// Email Field
export const EmailField: React.FC<Omit<FormFieldProps, 'type'>> = (props) => (
  <FormField
    type="email"
    placeholder="Enter your email address"
    showSuccess={true}
    {...props}
  />
);

// Password Field
export const PasswordField: React.FC<Omit<FormFieldProps, 'type'>> = (props) => (
  <FormField
    type="password"
    placeholder="Enter your password"
    {...props}
  />
);

// Username Field
export const UsernameField: React.FC<Omit<FormFieldProps, 'type'>> = (props) => (
  <FormField
    type="text"
    placeholder="Choose a username"
    showSuccess={true}
    {...props}
  />
);

// Bio Field (Textarea variant)
export const BioField: React.FC<Omit<FormFieldProps, 'type'> & { rows?: number }> = ({ 
  rows = 4, 
  ...props 
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-gray-300"
      >
        {props.label}
        {props.required && <span className="text-red-400 ml-1">*</span>}
      </label>
    </div>
    
    <textarea
      id={props.id}
      name={props.name}
      value={props.value}
      onChange={props.onChange as any}
      onBlur={props.onBlur as any}
      required={props.required}
      placeholder={props.placeholder}
      disabled={props.disabled}
      rows={rows}
      className="w-full px-4 py-3 bg-gray-900/60 backdrop-blur-sm border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 focus:ring-offset-1 transition-all duration-200 outline-none placeholder-gray-500 text-white resize-none"
    />
  </div>
);