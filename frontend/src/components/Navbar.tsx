import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar as BsNavbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../hooks';
import { companyProfile } from '../content/companyProfile';
import { publicAsset } from '../utils/publicPath';

const Navbar: React.FC = () => {
  const companyLogo = publicAsset('/assets/logo/logo-pipu.png');
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: 'Beranda', path: '/' },
    { label: 'Tentang Kami', path: '/tentang-kami' },
    { label: 'Pelatihan', path: '/pelatihan' },
    { label: 'Kontak', path: '/kontak' },
  ];

  return (
    <BsNavbar expand="lg" sticky="top" className="app-navbar shadow-sm border-bottom">
      <Container fluid="lg">
        <BsNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 me-lg-4">
          <img src={companyLogo} alt={`${companyProfile.shortName} logo`} className="brand-logo" />
          <span className="fw-bold text-dark lh-sm">
            <span className="d-block">{companyProfile.shortName}</span>
            <span className="d-block small text-muted fw-semibold">Pelatihan & Outbond</span>
          </span>
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="main-navbar" />

        <BsNavbar.Collapse id="main-navbar">
          <Nav className="mx-lg-auto my-3 my-lg-0 gap-lg-1">
            {navLinks.map((link) => (
              <Nav.Link
                key={link.path}
                as={Link}
                to={link.path}
                className={`nav-link-pill px-3 py-2 ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

          <Nav className="align-items-lg-center gap-2">
            {isAuthenticated && user ? (
              <>
                {user.role === 'admin' && (
                  <Nav.Link as={Link} to="/admin" className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2">
                    <LayoutDashboard size={16} />
                    Admin
                  </Nav.Link>
                )}
                <Dropdown align="end">
                  <Dropdown.Toggle
                    id="profile-dropdown"
                    variant="light"
                    className="nav-user-trigger d-inline-flex align-items-center gap-2"
                  >
                    <span className="brand-mark theme-brand-avatar-sm">
                      {user.nama.charAt(0).toUpperCase()}
                    </span>
                    <span className="fw-semibold">{user.nama}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="nav-user-menu border-0">
                    <Dropdown.ItemText>
                      <span className="d-block fw-semibold">{user.nama}</span>
                      <small className="text-muted">{user.email}</small>
                    </Dropdown.ItemText>
                    <Dropdown.ItemText>
                      <span className="badge bg-primary-subtle text-primary">
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </Dropdown.ItemText>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={logout} className="text-danger d-flex align-items-center gap-2">
                      <LogOut size={16} />
                      Keluar
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  className="btn btn-outline-primary btn-sm auth-nav-btn auth-nav-btn-login d-inline-flex align-items-center justify-content-center gap-2"
                >
                  <LogIn size={16} />
                  Masuk
                </Nav.Link>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
