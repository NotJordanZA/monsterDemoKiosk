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
  primary: 'bg-cyber-dark border-2 border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-cyber-dark neon-glow-green',
  secondary: 'bg-cyber-dark border-2 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-dark neon-glow-cyan',
  danger: 'bg-cyber-dark border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-cyber-dark',
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
  const baseClasses = 'wireframe-border font-bold transition-all duration-200 matrix-text uppercase tracking-widest';
  const glowClasses = glowing ? 'neon-glow-green animate-glow' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95';
  
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