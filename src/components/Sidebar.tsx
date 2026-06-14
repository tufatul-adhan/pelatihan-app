import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, LogOut } from 'lucide-react';
import { Offcanvas } from 'react-bootstrap';
import { useAuth } from '../hooks';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard',
    href: '/admin',
  },
  {
    icon: <BookOpen size={20} />,
    label: 'Pelatihan',
    href: '/admin/trainings',
  },
  {
    icon: <FileText size={20} />,
    label: 'Permintaan',
    href: '/admin/requests',
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <Offcanvas show={isOpen} onHide={onClose} className="w-100 theme-admin-offcanvas">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <Link to="/admin" className="text-decoration-none d-flex align-items-center gap-2">
            <div className="theme-admin-mini-logo">
              P
            </div>
            <span className="fw-bold text-dark">Admin</span>
          </Link>
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column p-0">
        <nav className="flex-grow-1 px-3 py-4">
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={`theme-offcanvas-nav-link d-flex align-items-center gap-3 px-3 py-2 text-decoration-none mb-2 ${
                isActive(item.href) ? 'active' : ''
              }`}
            >
              {item.icon}
              <span className="small">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-3 py-3 border-top">
          <button
            onClick={handleLogout}
            className="d-flex align-items-center gap-3 px-3 py-2 w-100 btn btn-outline-danger btn-sm"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export const useSidebarState = (initialState = true) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return { isOpen, toggle, close, open };
};
