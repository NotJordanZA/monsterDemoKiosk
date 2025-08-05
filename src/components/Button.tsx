import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
  glowing?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-monster-green hover:bg-monster-green text-monster-dark hover:text-monster-dark',
  secondary: 'bg-monster-light-gray hover:bg-monster-silver text-monster-white hover:text-monster-dark',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

const sizeStyles: Record<ButtonSize, string> = {
  small: 'px-4 py-2 text-sm',
  medium: 'px-6 py-3 text-base',
  large: 'px-8 py-4 text-lg',
  xl: 'px-12 py-6 text-xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'large',
  fullWidth = false,
  glowing = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'game-button rounded-xl font-bold transition-all duration-200 touch-focus';
  const glowClasses = glowing ? 'monster-glow-strong animate-glow' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95';
  
  return (
    <button
      className={[
        baseClasses,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        glowClasses,
        disabledClasses,
        className
      ].filter(Boolean).join(' ')}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;