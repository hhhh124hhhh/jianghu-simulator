import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
}: ButtonProps) => {
  const baseClasses =
    'font-semibold transition-all duration-250 ease-out disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-gradient-to-br from-gold-primary to-gold-dark text-background-near hover:brightness-110 hover:shadow-gold-glow active:scale-98 active:brightness-95',
    secondary:
      'bg-transparent border-2 border-gold-primary text-gold-primary hover:bg-gold-primary/10 hover:border-gold-light active:bg-gold-primary/20',
    text: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-background-hover',
  };

  const sizeClasses = {
    sm: 'h-10 px-4 text-sm rounded-sm',
    md: 'h-12 px-6 text-base rounded-md',
    lg: 'h-14 px-8 text-lg rounded-md',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

interface OptionButtonProps {
  label: string;
  description?: string;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const OptionButton = ({
  label,
  description,
  onClick,
  selected = false,
  disabled = false,
  children,
  className = '',
}: OptionButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full min-h-20 p-6 rounded-lg text-left
        bg-background-dark border transition-all duration-300
        hover:bg-background-hover hover:-translate-y-0.5
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
        ${
          selected
            ? 'border-2 border-gold-primary shadow-gold-glow'
            : 'border border-border-subtle hover:border-gold-primary/30'
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div
          className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          font-bold text-lg
          ${
            selected
              ? 'bg-gold-primary text-background-near'
              : 'bg-background-hover text-gold-primary border border-gold-primary'
          }
        `}
        >
          {label}
        </div>
        <div className="flex-1 space-y-1">
          {children || (
            <p className="text-text-primary text-body-lg font-medium">
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};
