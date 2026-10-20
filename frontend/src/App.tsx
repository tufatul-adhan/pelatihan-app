import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components';
import Navbar from './components/Navbar';
import { ProtectedRoute, LoadingSpinner } from './components';
import { companyProfile } from './content/companyProfile';
import { appPath, getRouterBasename, publicAsset } from './utils/publicPath';
import HomePage from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const COMPANY_LOGO = publicAsset('/assets/logo/logo-pipu.png');

// Lazy load pages that aren't needed immediately
const TrainingListPage = lazy(() => import('./pages/TrainingListPage'));
const RequestFormPage = lazy(() => import('./pages/RequestFormPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const KontakPage = lazy(() => import('./pages/KontakPage'));
const CompanyProfilePage = lazy(() => import('./pages/CompanyProfilePage'));

// Fallback component for lazy-loaded routes
const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center min-vh-100">
    <LoadingSpinner />
  </div>
);

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('App render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-vh-100 d-flex align-items-center py-5">
          <div className="container">
            <div className="surface-card p-4 p-lg-5 text-center mx-auto content-max-md">
              <img src={COMPANY_LOGO} alt={`${companyProfile.shortName} logo`} className="brand-logo mb-3" />
              <h1 className="h3 fw-bold mb-2">Terjadi kesalahan tampilan</h1>
              <p className="section-copy mb-4">
                Silakan muat ulang halaman. Jika masih terjadi, coba kembali ke beranda.
              </p>
              <button className="btn btn-primary" onClick={() => window.location.assign(appPath('/'))}>
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

const MotionObserver = () => {
  const location = useLocation();

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileViewport = window.matchMedia('(max-width: 991.98px)').matches;
    const lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
    const navWithMemory = navigator as Navigator & { deviceMemory?: number };
    const lowMemory = typeof navWithMemory.deviceMemory === 'number' && navWithMemory.deviceMemory <= 4;
    const disableScrollAnimation = reduceMotion || isMobileViewport || lowCpu || lowMemory;

    const selectors = [
      '.surface-card',
      '.metric-card',
      '.training-card',
      '.admin-card',
      '.activity-gallery-card',
      '.map-panel',
      '.hero-panel',
    ].join(',');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.02 }
    );

    const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors));

    if (disableScrollAnimation) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return () => observer.disconnect();
    }

    elements.forEach((element) => {
      if (element.classList.contains('reveal-on-scroll')) return;

      element.classList.add('reveal-on-scroll');
      observer.observe(element);
    });

    // Show current viewport elements immediately to avoid initial jank.
    elements.forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.95) {
        element.classList.add('is-visible');
        observer.unobserve(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [location.pathname]);

  return null;
};

const NotFoundPage = () => (
  <section className="page-section">
    <div className="container-lg text-center">
      <div className="surface-card p-4 p-lg-5 mx-auto content-max-lg">
        <span className="section-eyebrow mb-3">404</span>
        <h1 className="section-title h2 mb-3">Halaman tidak ditemukan</h1>
        <p className="section-copy mb-4">
          Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.
        </p>
        <Link to="/" className="btn btn-primary">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  </section>
);

const AppShell = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="d-flex flex-column min-vh-100 app-main">
      {!isAdminRoute && <Navbar />}

      <main className="flex-grow-1">
        <AppErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/tentang-kami"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CompanyProfilePage />
                </Suspense>
              }
            />
            <Route
              path="/pelatihan"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TrainingListPage />
                </Suspense>
              }
            />
            <Route
              path="/form"
              element={
                <Suspense fallback={<PageLoader />}>
                  <RequestFormPage />
                </Suspense>
              }
            />
            <Route
              path="/kontak"
              element={
                <Suspense fallback={<PageLoader />}>
                  <KontakPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Suspense fallback={<PageLoader />}>
                    <AdminPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppErrorBoundary>
      </main>

      {!isAdminRoute && (
        <footer className="site-footer py-5 mt-auto">
          <div className="container-lg">
            <div className="row g-4 mb-4">
              <div className="col-lg-4 col-md-6">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <img src={COMPANY_LOGO} alt={`${companyProfile.shortName} logo`} className="brand-logo" />
                  <h5 className="fw-bold mb-0 text-white">{companyProfile.name}</h5>
                </div>
                <p className="site-footer-copy small mb-0">
                  Layanan pelatihan dan outbond untuk membangun karakter, disiplin,
                  leadership, mentalitas dasar, dan wawasan kebangsaan.
                </p>
              </div>
              <div className="col-lg-2 col-md-6">
                <h6 className="site-footer-title">Produk</h6>
                <ul className="list-unstyled small">
                  <li className="mb-2"><Link to="/pelatihan" className="footer-link">Pelatihan</Link></li>
                  <li className="mb-2"><Link to="/form" className="footer-link">Ajukan Program</Link></li>
                  <li><Link to="/kontak" className="footer-link">Konsultasi</Link></li>
                </ul>
              </div>
              <div className="col-lg-2 col-md-6">
                <h6 className="site-footer-title">Perusahaan</h6>
                <ul className="list-unstyled small">
                  <li className="mb-2"><Link to="/tentang-kami" className="footer-link">Tentang Kami</Link></li>
                  <li><Link to="/kontak" className="footer-link">Hubungi Kami</Link></li>
                </ul>
              </div>
              <div className="col-lg-4 col-md-6">
                <h6 className="site-footer-title">Kontak</h6>
                <p className="site-footer-copy small mb-2">{companyProfile.address}</p>
                <p className="site-footer-copy small mb-2">indonesiapelatihanunggul@gmail.com</p>
                <p className="site-footer-copy small mb-0">+62 895 1360 0930</p>
              </div>
            </div>

            <div className="footer-bottom pt-4 text-center small">
              <p className="mb-0">&copy; 2026 {companyProfile.name}. Semua hak dilindungi.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router basename={getRouterBasename()}>
          <MotionObserver />
          <AppShell />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
