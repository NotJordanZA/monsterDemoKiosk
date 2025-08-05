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
        className="block text-xl font-bold text-cyber-green mb-3 matrix-text uppercase tracking-widest"
      >
        [{label.replace(/\s/g, '_')}]
        {required && <span className="text-cyber-cyan ml-1">*</span>}
      </label>
      <input
        id={inputId}
        className={[
          'w-full bg-cyber-dark border-2 border-cyber-green text-cyber-green wireframe-border',
          'focus:border-cyber-cyan focus:bg-cyber-dark focus:neon-glow-cyan',
          'placeholder-cyber-cyan placeholder-opacity-50 transition-all duration-200 font-matrix tracking-wide',
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