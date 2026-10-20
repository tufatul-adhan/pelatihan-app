import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

const DEFAULT_BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  '/admin': [
    { label: 'Dashboard', href: '/admin' },
  ],
  '/admin/trainings': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Pelatihan' },
  ],
  '/admin/requests': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Permintaan' },
  ],
  '/admin/reports': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Laporan' },
  ],
  '/admin/settings': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Pengaturan' },
  ],
  '/pelatihan': [
    { label: 'Beranda', href: '/' },
    { label: 'Pelatihan' },
  ],
  '/form': [
    { label: 'Beranda', href: '/' },
    { label: 'Ajukan Permintaan' },
  ],
  '/tentang-kami': [
    { label: 'Beranda', href: '/' },
    { label: 'Tentang Kami' },
  ],
  '/kontak': [
    { label: 'Beranda', href: '/' },
    { label: 'Kontak' },
  ],
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const location = useLocation();
  const breadcrumbItems = items || DEFAULT_BREADCRUMBS[location.pathname] || [];

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav className="d-flex align-items-center gap-2" aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="d-flex align-items-center gap-2">
          {index > 0 && <ChevronRight size={16} className="text-muted" />}
          {item.href ? (
            <Link
              to={item.href}
              className="link-primary text-decoration-none small fw-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-muted small fw-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};
