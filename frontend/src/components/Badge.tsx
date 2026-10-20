import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'primary', 
  children, 
  className = '' 
}) => {
  const variantMap: Record<BadgeVariant, string> = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    secondary: 'bg-secondary',
    gray: 'bg-secondary',
  };

  return (
    <span className={`badge ${variantMap[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const statusMap: Record<string, { variant: BadgeVariant; label: string }> = {
    pending: { variant: 'warning', label: 'Menunggu' },
    diproses: { variant: 'success', label: 'Diterima' },
    ditolak: { variant: 'danger', label: 'Ditolak' },
    selesai: { variant: 'primary', label: 'Selesai' },
    approved: { variant: 'success', label: 'Diterima' },
    rejected: { variant: 'danger', label: 'Ditolak' },
    completed: { variant: 'primary', label: 'Selesai' },
    cancelled: { variant: 'secondary', label: 'Dibatalkan' },
  };

  const badgeConfig = statusMap[status.toLowerCase()] || { 
    variant: 'secondary' as BadgeVariant, 
    label: status 
  };

  return (
    <Badge variant={badgeConfig.variant} className={className}>
      {badgeConfig.label}
    </Badge>
  );
};
