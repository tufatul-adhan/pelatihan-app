import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
}) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      {icon && <div className="mb-3">{icon}</div>}
      <h3 className="h5 fw-semibold text-dark mb-2">{title}</h3>
      <p className="text-muted text-center theme-empty-copy">{description}</p>
    </div>
  );
};

export default EmptyState;
