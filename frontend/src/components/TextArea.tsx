import React from 'react';

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
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
      <textarea
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        rows={4}
        {...props}
      />
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};

export default TextArea;
