import React from 'react';
import { Placeholder, PlaceholderButton } from 'react-bootstrap';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width = '100%',
  height = 20,
}) => {
  let borderRadius = '0.375rem';
  if (variant === 'circular') {
    borderRadius = '50%';
  } else if (variant === 'rectangular') {
    borderRadius = '0.5rem';
  }

  return (
    <Placeholder
      className={`w-100 ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
      }}
      animation="glow"
    />
  );
};

interface SkeletonLoaderProps {
  count?: number;
  height?: number;
  type?: 'card' | 'table' | 'list';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 3,
  height = 200,
  type = 'card',
}) => {
  if (type === 'card') {
    return (
      <div className="row g-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="col-md-4">
            <Placeholder as="div" animation="glow">
              <Placeholder style={{ height: `${height}px` }} className="w-100 mb-3" />
              <Placeholder className="w-75 mb-2" />
              <Placeholder className="w-50 mb-2" />
              <div className="d-grid gap-2">
                <PlaceholderButton variant="primary" />
                <PlaceholderButton variant="secondary" />
              </div>
            </Placeholder>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-3">
        {Array.from({ length: count }).map((_, i) => (
          <Placeholder key={i} as="div" animation="glow" className="mb-3 d-flex gap-3">
            <Placeholder style={{ width: '20%', height: '50px' }} />
            <Placeholder style={{ width: '30%', height: '50px' }} />
            <Placeholder style={{ width: '25%', height: '50px' }} />
            <Placeholder style={{ width: '25%', height: '50px' }} />
          </Placeholder>
        ))}
      </div>
    );
  }

  return (
    <div className="space-3">
      {Array.from({ length: count }).map((_, i) => (
        <Placeholder key={i} as="div" animation="glow" className="mb-3">
          <Placeholder style={{ height: '60px' }} className="w-100" />
        </Placeholder>
      ))}
    </div>
  );
};
