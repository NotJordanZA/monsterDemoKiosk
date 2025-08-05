import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  size?: 'medium' | 'large' | 'xl';
}

const sizeStyles = {
  medium: 'px-4 py-3 text-base',
  large: 'px-6 py-4 text-lg',
  xl: 'px-8 py-6 text-xl',
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  required,
  size = 'xl',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="mb-6">
      <label
        htmlFor={inputId}
        className="block text-xl font-bold text-monster-white mb-3"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        id={inputId}
        className={[
          'w-full bg-monster-gray border-2 border-monster-light-gray text-monster-white rounded-xl',
          'focus:border-monster-green focus:bg-monster-dark focus:ring-2 focus:ring-monster-green focus:ring-opacity-50',
          'placeholder-monster-silver transition-all duration-200',
          error ? 'border-red-500 focus:border-red-500' : '',
          sizeStyles[size],
          className
        ].filter(Boolean).join(' ')}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;