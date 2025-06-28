import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  inputType?: 'input' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  rows?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  inputType = 'input',
  options = [],
  rows = 3,
  className = '',
  ...props
}) => {
  const baseInputClasses = `block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm transition-colors duration-200 ${
    error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
  }`;

  const renderInput = () => {
    switch (inputType) {
      case 'select':
        return (
          <select className={`${baseInputClasses} ${className}`} {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}>
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            rows={rows}
            className={`${baseInputClasses} resize-none ${className}`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        );
      default:
        return (
          <input
            className={`${baseInputClasses} ${className}`}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="text-sm text-red-600 animate-slide-down">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input; 