import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ClipboardList,
  Edit2,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  Trash2,
  UserCircle2,
  X,
} from 'lucide-react';
import { Breadcrumb, ConfirmDialog, SkeletonLoader, Table, useToast } from '../components';
import DashboardChart from '../components/DashboardChart';
import AdminInsightCharts from '../components/AdminInsightCharts';
import { authService, requestService, trainingService } from '../services';
import { useAuth } from '../hooks';
import { Permintaan, Training, User } from '../types';
import { formatRupiah } from '../utils/currency';
import AdminTrainingForm from './AdminPages/AdminTrainingForm';
import AdminRequestsList from './AdminPages/AdminRequestsList';
import AdminOperationalReport from './AdminPages/AdminOperationalReport';

type AdminView = 'dashboard' | 'trainings' | 'requests' | 'reports' | 'settings';

interface SidebarMenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarSection {
  title: string;
  subtitle: string;
  items: SidebarMenuItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'DASHBOARD',
    subtitle: 'Ringkasan operasional',
    items: [{ label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={17} /> }],
  },
  {
    title: 'DATA PROGRAM',
    subtitle: 'Kelola layanan utama',
    items: [
      { label: 'Pelatihan', path: '/admin/trainings', icon: <BookOpen size={17} /> },
      { label: 'Permintaan', path: '/admin/requests', icon: <ClipboardList size={17} /> },
      { label: 'Laporan', path: '/admin/reports', icon: <FileBarChart2 size={17} /> },
    ],
  },
  {
    title: 'SISTEM',
    subtitle: 'Pengaturan akun admin',
    items: [{ label: 'Pengaturan', path: '/admin/settings', icon: <Settings size={17} /> }],
  },
];

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, setUser } = useAuth();
  const { addToast } = useToast();

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [requests, setRequests] = useState<Permintaan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [settingsForm, setSettingsForm] = useState(() => {
    const defaults = {
      nama: user?.nama || '',
      email: user?.email || '',
      notifyEmail: true,
      compactTable: false,
    };

    try {
      const stored = localStorage.getItem('adminPreferences');
      if (!stored) return defaults;
      const parsed = JSON.parse(stored) as { notifyEmail?: boolean; compactTable?: boolean };
      return {
        ...defaults,
        notifyEmail: parsed.notifyEmail ?? defaults.notifyEmail,
        compactTable: parsed.compactTable ?? defaults.compactTable,
      };
    } catch (error) {
      return defaults;
    }
  });

  useEffect(() => {
    setSettingsForm((prev) => ({
      ...prev,
      nama: user?.nama || '',
      email: user?.email || '',
    }));
  }, [user]);

  const currentView: AdminView = useMemo(() => {
    if (location.pathname.includes('/requests')) return 'requests';
    if (location.pathname.includes('/trainings')) return 'trainings';
    if (location.pathname.includes('/reports')) return 'reports';
    if (location.pathname.includes('/settings')) return 'settings';
    return 'dashboard';
  }, [location.pathname]);

  const viewMeta = useMemo(() => {
    if (currentView === 'trainings') {
      return {
        title: 'Manajemen Pelatihan',
        subtitle: 'Kelola program pelatihan yang tampil di katalog publik.',
      };
    }

    if (currentView === 'requests') {
      return {
        title: 'Permintaan Pelatihan',
        subtitle: 'Kelola semua pengajuan dari pengguna.',
      };
    }

    if (currentView === 'reports') {
      return {
        title: 'Laporan Admin',
        subtitle: 'Lihat ringkasan data dan export laporan operasional.',
      };
    }

    if (currentView === 'settings') {
      return {
        title: 'Pengaturan Admin',
        subtitle: 'Atur profil admin dan preferensi penggunaan panel.',
      };
    }

    return {
      title: 'Dashboard Admin',
      subtitle: 'Ringkasan performa dan aktivitas terbaru.',
    };
  }, [currentView]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const monthlyStats = useMemo(() => {
    const monthMap = new Map<string, { label: string; trainings: number; requests: number }>();

    const addMonth = (
      dateValue: string | undefined,
      type: 'trainings' | 'requests'
    ) => {
      const date = dateValue ? new Date(dateValue) : new Date();
      const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
      const key = `${safeDate.getFullYear()}-${String(safeDate.getMonth() + 1).padStart(2, '0')}`;
      const label = safeDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
      const current = monthMap.get(key) || { label, trainings: 0, requests: 0 };
      current[type] += 1;
      monthMap.set(key, current);
    };

    trainings.forEach((training) => addMonth(training.createdAt, 'trainings'));
    requests.forEach((request) => addMonth(request.created_at, 'requests'));

    const entries = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b));

    return {
      months: entries.map(([, value]) => value.label),
      trainingsData: entries.map(([, value]) => value.trainings),
      requestsData: entries.map(([, value]) => value.requests),
    };
  }, [requests, trainings]);

  const loadTrainings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await trainingService.getTrainings({ forceRefresh: true, limit: 100 });
      setTrainings(data);
    } catch (error) {
      console.error('Failed to load trainings:', error);
      addToast('Gagal memuat pelatihan', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const loadRequests = useCallback(async () => {
    try {
      const data = await requestService.getAllRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Gagal memuat data permintaan';
      addToast(message, 'error');
    }
  }, [addToast]);

  useEffect(() => {
    loadTrainings();
    loadRequests();
  }, [loadRequests, loadTrainings]);

  const handleNavigate = (path: string) => {
    setShowForm(false);
    navigate(path);
  };

  const handleAddTraining = () => {
    setEditingTraining(null);
    setShowForm(true);
    navigate('/admin/trainings');
  };

  const handleEditTraining = (training: Training) => {
    setEditingTraining(training);
    setShowForm(true);
    navigate('/admin/trainings');
  };

  const handleDeleteTraining = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(true);
      await trainingService.deleteTraining(deleteConfirm.id);
      addToast(`Pelatihan "${deleteConfirm.name}" berhasil dihapus`, 'success');
      setDeleteConfirm(null);
      loadTrainings();
    } catch (error) {
      console.error('Failed to delete training:', error);
      addToast('Gagal menghapus pelatihan', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTraining(null);
  };

  const handleFormSuccess = () => {
    addToast('Perubahan berhasil disimpan', 'success');
    handleFormClose();
    loadTrainings();
    loadRequests();
  };

  const pendingCount = requests.filter((request) => (request.status || 'pending') === 'pending').length;
  const acceptedCount = requests.filter((request) => request.status === 'diproses').length;
  const rejectedCount = requests.filter((request) => request.status === 'ditolak').length;

  const stats = [
    {
      label: 'Total Pelatihan',
      value: trainings.length,
      caption: `${trainings.length} program aktif`,
      tone: 'primary',
      icon: <BookOpen size={20} />,
    },
    {
      label: 'Total Permintaan',
      value: requests.length,
      caption: `${pendingCount} menunggu proses`,
      tone: 'success',
      icon: <ClipboardList size={20} />,
    },
    {
      label: 'Permintaan Diterima',
      value: acceptedCount,
      caption: `${requests.length ? Math.round((acceptedCount / requests.length) * 100) : 0}% dari total`,
      tone: 'warning',
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: 'Permintaan Ditolak',
      value: rejectedCount,
      caption: `${requests.length ? Math.round((rejectedCount / requests.length) * 100) : 0}% dari total`,
      tone: 'danger',
      icon: <X size={20} />,
    },
  ];

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsSavingSettings(true);
      const nama = settingsForm.nama.trim();
      const email = settingsForm.email.trim();

      if (!nama || !email) {
        addToast('Nama dan email wajib diisi', 'error');
        return;
      }

      const updatedUser = await authService.updateProfile(nama, email);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      localStorage.setItem(
        'adminPreferences',
        JSON.stringify({
          notifyEmail: settingsForm.notifyEmail,
          compactTable: settingsForm.compactTable,
        })
      );
      setUser(updatedUser as User);

      addToast('Pengaturan admin berhasil diperbarui', 'success');
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Gagal menyimpan pengaturan admin';
      addToast(message, 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const renderDashboard = () => (
    <>
      <div className="row g-3 mb-4">
        {stats.map((stat) => (
          <div className="col-sm-6 col-xl-3" key={stat.label}>
            <div className={`admin-kpi-card tone-${stat.tone}`}>
              <div className="d-flex align-items-start justify-content-between gap-3 mb-4">
                <div>
                  <p className="admin-kpi-label mb-2">{stat.label}</p>
                  <p className="admin-kpi-value mb-0">{stat.value}</p>
                </div>
                <div className="admin-kpi-icon">{stat.icon}</div>
              </div>
              <p className="admin-kpi-caption mb-0">{stat.caption}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <DashboardChart
          labels={monthlyStats.months.length ? monthlyStats.months : ['Bulan ini']}
          data={monthlyStats.trainingsData.length ? monthlyStats.trainingsData : [trainings.length]}
          secondaryData={monthlyStats.requestsData.length ? monthlyStats.requestsData : [requests.length]}
          label="Pelatihan"
          secondaryLabel="Permintaan"
        />
      </div>

      <div className="mb-4">
        <AdminInsightCharts requests={requests} trainings={trainings} />
      </div>

      <div className="admin-card p-4">
        <h2 className="h5 fw-bold mb-3">Aksi Cepat</h2>
        <div className="d-flex flex-column flex-md-row gap-3">
          <button onClick={handleAddTraining} className="btn btn-primary d-inline-flex align-items-center gap-2">
            <Plus size={18} />
            Tambah Pelatihan Baru
          </button>
          <button onClick={() => handleNavigate('/admin/requests')} className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
            <ClipboardList size={18} />
            Lihat Permintaan
          </button>
          <button onClick={() => handleNavigate('/admin/reports')} className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
            <FileBarChart2 size={18} />
            Buka Laporan
          </button>
        </div>
      </div>
    </>
  );

  const renderTrainings = () => (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h3 fw-bold mb-1">Daftar Pelatihan</h2>
          <p className="section-copy mb-0">Atur konten pelatihan untuk katalog publik.</p>
        </div>
        <button onClick={handleAddTraining} className="btn btn-primary d-inline-flex align-items-center gap-2">
          <Plus size={18} />
          Tambah Pelatihan
        </button>
      </div>

      {isLoading ? (
        <SkeletonLoader count={5} type="table" />
      ) : (
        <div className="admin-card p-3">
          <Table<Training>
            columns={[
              {
                key: 'title',
                label: 'Nama Pelatihan',
                sortable: true,
              },
              {
                key: 'description',
                label: 'Deskripsi',
                render: (value) => <span className="line-clamp-2 text-muted">{value || '-'}</span>,
              },
              {
                key: 'price',
                label: 'Harga',
                sortable: true,
                render: (value) => (
                  <span className="fw-bold">
                    {formatRupiah(value)}
                  </span>
                ),
              },
              {
                key: 'id',
                label: 'Aksi',
                width: '230px',
                render: (_, row) => (
                  <div className="admin-action-group">
                    <button
                      onClick={() => handleEditTraining(row)}
                      className="admin-action-btn primary"
                      title={`Edit pelatihan ${row.title}`}
                    >
                      <Edit2 size={15} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ id: row.id, name: row.title })}
                      className="admin-action-btn danger"
                      title={`Hapus pelatihan ${row.title}`}
                    >
                      <Trash2 size={15} />
                      <span>Hapus</span>
                    </button>
                  </div>
                ),
              },
            ]}
            data={trainings}
            keyExtractor={(row) => row.id}
            isEmpty={trainings.length === 0}
            emptyMessage="Belum ada pelatihan"
          />
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <AdminOperationalReport requests={requests} trainings={trainings} onToast={addToast} />
  );

  const renderSettings = () => (
    <div className="admin-card p-4 p-lg-5">
      <h2 className="h4 fw-bold mb-1">Profil & Preferensi Admin</h2>
      <p className="section-copy mb-4">Pengaturan ini membantu personalisasi pengalaman kerja di panel admin.</p>

      <form onSubmit={handleSaveSettings} className="row g-4">
        <div className="col-lg-6">
          <label className="form-label fw-semibold">Nama Admin</label>
          <input
            type="text"
            className="form-control"
            value={settingsForm.nama}
            onChange={(event) => setSettingsForm((prev) => ({ ...prev, nama: event.target.value }))}
            required
          />
        </div>

        <div className="col-lg-6">
          <label className="form-label fw-semibold">Email Admin</label>
          <input
            type="email"
            className="form-control"
            value={settingsForm.email}
            onChange={(event) => setSettingsForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </div>

        <div className="col-12">
          <div className="admin-settings-switch">
            <div>
              <p className="fw-semibold mb-1">Notifikasi Email</p>
              <p className="text-muted small mb-0">Terima update aktivitas admin via email.</p>
            </div>
            <input
              type="checkbox"
              className="form-check-input"
              checked={settingsForm.notifyEmail}
              onChange={(event) => setSettingsForm((prev) => ({ ...prev, notifyEmail: event.target.checked }))}
            />
          </div>
        </div>

        <div className="col-12">
          <div className="admin-settings-switch">
            <div>
              <p className="fw-semibold mb-1">Mode Tabel Ringkas</p>
              <p className="text-muted small mb-0">Tampilkan tabel dengan kepadatan data lebih tinggi.</p>
            </div>
            <input
              type="checkbox"
              className="form-check-input"
              checked={settingsForm.compactTable}
              onChange={(event) => setSettingsForm((prev) => ({ ...prev, compactTable: event.target.checked }))}
            />
          </div>
        </div>

        <div className="col-12 d-flex flex-column flex-sm-row gap-2">
          <button type="submit" className="btn btn-primary" disabled={isSavingSettings}>
            {isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
          <button type="button" className="btn btn-outline-primary" onClick={() => setSettingsForm({
            nama: user?.nama || '',
            email: user?.email || '',
            notifyEmail: true,
            compactTable: false,
          })}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <section className="admin-console">
      <div className={`admin-console-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <div className="admin-sidebar-logo">IP</div>
            <div>
              <p className="admin-sidebar-title mb-0">Admin Panel</p>
              <small className="admin-sidebar-subtitle">PT Indonesia Pelatihan Unggul</small>
            </div>
          </div>

          <div className="admin-sidebar-scroll">
            {sidebarSections.map((section) => (
              <div key={section.title} className="admin-menu-group">
                <p className="admin-menu-title mb-1">{section.title}</p>
                <p className="admin-menu-subtitle mb-2">{section.subtitle}</p>

                <div className="d-grid gap-2">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

                    return (
                      <button
                        key={`${section.title}-${item.label}`}
                        type="button"
                        onClick={() => handleNavigate(item.path)}
                        className={`admin-menu-item ${isActive ? 'active' : ''}`}
                      >
                        <span className="admin-menu-icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={17} />
            Keluar
          </button>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="admin-topbar-menu-btn"
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="Toggle sidebar"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="admin-topbar-title mb-0">{viewMeta.title}</p>
                <small className="text-muted">{viewMeta.subtitle}</small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="admin-topbar-icon-btn"
                aria-label="Notifikasi"
                onClick={() => handleNavigate('/admin/requests')}
                title="Lihat permintaan"
              >
                <Bell size={16} />
              </button>
              <button
                type="button"
                className="admin-topbar-icon-btn"
                aria-label="Laporan"
                onClick={() => handleNavigate('/admin/reports')}
                title="Buka laporan"
              >
                <FileBarChart2 size={16} />
              </button>
              <button
                type="button"
                className="admin-topbar-icon-btn"
                aria-label="Pengaturan"
                onClick={() => handleNavigate('/admin/settings')}
                title="Buka pengaturan"
              >
                <Settings size={16} />
              </button>
              <div className="admin-user-pill">
                <UserCircle2 size={18} />
                <span>{user?.nama || 'Admin'}</span>
              </div>
            </div>
          </header>

          <div className="admin-content-wrap">
            <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 mb-4">
              <Breadcrumb />
              <span className="section-eyebrow mb-0">Admin Workspace</span>
            </div>

            {showForm ? (
              <AdminTrainingForm
                training={editingTraining}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
              />
            ) : currentView === 'dashboard' ? (
              renderDashboard()
            ) : currentView === 'trainings' ? (
              renderTrainings()
            ) : currentView === 'reports' ? (
              renderReports()
            ) : currentView === 'settings' ? (
              renderSettings()
            ) : (
              <AdminRequestsList />
            )}
          </div>
        </main>
      </div>

      {sidebarOpen && <button className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" />}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Hapus Pelatihan"
        message={`Apakah Anda yakin ingin menghapus "${deleteConfirm?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDeleteTraining}
        onCancel={() => setDeleteConfirm(null)}
      />
    </section>
  );
};

export default AdminPage;
