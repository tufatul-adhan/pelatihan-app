import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-3">
      {label && (
        <label className="form-label fw-semibold">
          {label}
          {props.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <input
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        {...props}
      />
      {error && <div className="invalid-feedback d-block">{error}</div>}
      {helperText && !error && (
        <small className="form-text text-muted d-block mt-1">{helperText}</small>
      )}
    </div>
  );
};

export default Input;
