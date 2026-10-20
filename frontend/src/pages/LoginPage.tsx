import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, LogIn } from 'lucide-react';
import { useAuth } from '../hooks';
import { Alert, Button, Input } from '../components';
import { publicAsset } from '../utils/publicPath';

export const LoginPage: React.FC = () => {
  const companyLogo = publicAsset('/assets/logo/logo-pipu.png');
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validateForm()) return;

      try {
        setNotification(null);
        await login(formData.email, formData.password);
        setNotification({ type: 'success', message: 'Login berhasil. Mengarahkan...' });
        let parsedUser: { role?: string } | null = null;
        try {
          const storedUser = localStorage.getItem('authUser');
          parsedUser = storedUser ? JSON.parse(storedUser) : null;
        } catch (parseError) {
          parsedUser = null;
        }
        const targetPath = parsedUser?.role === 'admin' ? '/admin' : '/';
        setTimeout(() => navigate(targetPath), 900);
      } catch (error) {
        setNotification({
          type: 'error',
          message: error instanceof Error ? error.message : 'Login gagal. Silakan coba lagi.',
        });
      }
    },
    [formData, login, navigate, validateForm]
  );

  return (
    <section className="auth-shell py-5">
      <div className="container">
        <div className="row auth-layout justify-content-center align-items-stretch g-0">
          <div className="col-lg-5 d-none d-lg-block">
            <aside className="auth-visual-panel h-100">
              <div>
                <img src={companyLogo} alt="Logo PT Indonesia Pelatihan Unggul" className="auth-visual-logo mb-4" />
                <p className="auth-visual-kicker mb-3">Admin & Peserta Portal</p>
                <h2 className="auth-visual-title mb-3">Akses cepat untuk mengelola program pelatihan.</h2>
                <p className="auth-visual-copy mb-4">
                  Pantau pengajuan, kelola katalog, dan pastikan setiap kebutuhan pelatihan diproses rapi.
                </p>
              </div>
              <div className="auth-visual-list">
                {['Dashboard admin aman', 'Data pelatihan terstruktur', 'Pengajuan peserta lebih cepat'].map((item) => (
                  <div className="auth-visual-item" key={item}>
                    <CheckCircle2 size={18} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="col-md-8 col-lg-5">
            <div className="surface-card auth-card p-4 p-lg-5 h-100">
              <div className="text-center mb-4">
                <img src={companyLogo} alt="Logo PT Indonesia Pelatihan Unggul" className="brand-logo auth-card-logo mb-3" />
                <h1 className="h3 fw-bold mb-2">Masuk ke akun Anda</h1>
                <p className="section-copy mb-0">Kelola permintaan dan program pelatihan dengan aman.</p>
              </div>

              {notification && (
                <Alert message={notification.message} type={notification.type} className="mb-4" />
              )}

              <form onSubmit={handleSubmit}>
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="indonesiapelatihanunggul@gmail.com"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Masukkan password"
                  required
                />

                <Button type="submit" className="w-100 mt-2 auth-submit-btn" loading={isLoading} disabled={isLoading}>
                  <LogIn size={17} />
                  {isLoading ? 'Memproses...' : 'Masuk'}
                </Button>
              </form>

              <div className="text-center text-muted mt-4 mb-0">
                <p className="mb-2">Belum punya akun?</p>
                <Link to="/register" className="btn btn-outline-primary auth-switch-btn">
                  Daftar sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
