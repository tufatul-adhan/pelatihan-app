import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`card ${onClick ? 'theme-clickable-card' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="card-body p-4">
        {children}
      </div>
    </div>
  );
};

export default Card;
