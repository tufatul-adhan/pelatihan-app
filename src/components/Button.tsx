import React from 'react';
import { Spinner } from 'react-bootstrap';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  isLoading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const isLoadingState = loading || isLoading;

  const variantMap = {
    primary: 'btn-primary',
    secondary: 'btn-success',
    outline: 'btn-outline-primary',
    danger: 'btn-danger',
  };

  const sizeMap = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  return (
    <button
      className={`btn ${variantMap[variant]} ${sizeMap[size]} d-flex align-items-center justify-content-center gap-2 ${className}`}
      disabled={disabled || isLoadingState}
      {...props}
    >
      {isLoadingState && (
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
          className="me-1"
        />
      )}
      {children}
    </button>
  );
};

export default Button;
