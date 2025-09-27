import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white'
  };
  
  const sizeClasses = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg',
    xl: 'py-4 px-8 text-xl'
  };

  return (
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className} font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;