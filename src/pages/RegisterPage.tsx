import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks';
import { Alert, Button, Input } from '../components';

export const RegisterPage: React.FC = () => {
  const companyLogo = '/assets/logo/logo-pipu.png';
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama) {
      newErrors.nama = 'Nama harus diisi';
    } else if (formData.nama.length < 3) {
      newErrors.nama = 'Nama minimal 3 karakter';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
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
        await register(formData.nama, formData.email, formData.password);
        setNotification({ type: 'success', message: 'Pendaftaran berhasil. Mengarahkan...' });
        setTimeout(() => navigate('/'), 900);
      } catch (error) {
        setNotification({
          type: 'error',
          message: error instanceof Error ? error.message : 'Pendaftaran gagal. Silakan coba lagi.',
        });
      }
    },
    [formData, register, navigate, validateForm]
  );

  return (
    <section className="auth-shell py-5">
      <div className="container">
        <div className="row auth-layout justify-content-center align-items-stretch g-0">
          <div className="col-lg-5 d-none d-lg-block">
            <aside className="auth-visual-panel h-100">
              <div>
                <img src={companyLogo} alt="Logo PT Indonesia Pelatihan Unggul" className="auth-visual-logo mb-4" />
                <p className="auth-visual-kicker mb-3">Portal Pelatihan</p>
                <h2 className="auth-visual-title mb-3">Daftarkan akun untuk memulai pengajuan program.</h2>
                <p className="auth-visual-copy mb-4">
                  Simpan data kontak, ajukan kebutuhan pelatihan, dan permudah proses koordinasi dengan tim.
                </p>
              </div>
              <div className="auth-visual-list">
                {['Form pengajuan terarah', 'Kontak perusahaan tersimpan', 'Proses tindak lanjut lebih rapi'].map((item) => (
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
                <h1 className="h3 fw-bold mb-2">Buat akun baru</h1>
                <p className="section-copy mb-0">Ajukan dan pantau kebutuhan pelatihan perusahaan Anda.</p>
              </div>

              {notification && (
                <Alert message={notification.message} type={notification.type} className="mb-4" />
              )}

              <form onSubmit={handleSubmit}>
                <Input
                  label="Nama Lengkap"
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  error={errors.nama}
                  placeholder="Nama Anda"
                  required
                />

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
                  placeholder="Minimal 6 karakter"
                  required
                />

                <Input
                  label="Konfirmasi Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="Ulangi password"
                  required
                />

                <Button type="submit" className="w-100 mt-2 auth-submit-btn" loading={isLoading} disabled={isLoading}>
                  <UserPlus size={17} />
                  {isLoading ? 'Membuat akun...' : 'Daftar'}
                </Button>
              </form>

              <div className="text-center text-muted mt-4 mb-0">
                <p className="mb-2">Sudah punya akun?</p>
                <Link to="/login" className="btn btn-outline-primary auth-switch-btn">
                  Masuk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
