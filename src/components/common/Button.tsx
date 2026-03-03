import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = ({ variant = 'primary', size = 'md', icon, children, className = '', ...props }: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-[#5B5FFF] text-white hover:bg-[#4A4EEE] focus:ring-[#5B5FFF]/30 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 focus:ring-gray-200',
    danger: 'bg-[#FF5B5B] text-white hover:bg-[#EE4A4A] focus:ring-[#FF5B5B]/30 shadow-sm',
    success: 'bg-[#00D68F] text-white hover:bg-[#00C57F] focus:ring-[#00D68F]/30 shadow-sm',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;