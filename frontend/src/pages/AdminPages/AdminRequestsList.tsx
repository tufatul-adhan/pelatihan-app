import React, { useCallback, useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Badge, SkeletonLoader, StatusBadge, Table, useToast } from '../../components';
import { requestService } from '../../services';
import { Permintaan } from '../../types';

const AdminRequestsList: React.FC = () => {
  const { addToast } = useToast();
  const [requests, setRequests] = useState<Permintaan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await requestService.getAllRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Gagal memuat data permintaan';
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleUpdateStatus = async (id: number, status: 'diproses' | 'ditolak') => {
    try {
      setUpdatingId(id);
      await requestService.updateRequestStatus(id, status);
      await loadRequests();
      addToast(
        status === 'diproses'
          ? 'Permintaan berhasil diterima'
          : 'Permintaan berhasil ditolak',
        'success'
      );
    } catch (error) {
      console.error('Failed to update request status:', error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Gagal memperbarui status permintaan';
      addToast(message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <SkeletonLoader count={5} type="table" />;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2 fw-bold mb-1">Permintaan Pelatihan</h1>
        <p className="section-copy mb-0">Kelola permintaan pelatihan dari pengguna.</p>
      </div>

      <div className="admin-card p-3">
        <Table<Permintaan>
          columns={[
            {
              key: 'id',
              label: 'ID',
              width: '80px',
            },
            {
              key: 'user_id',
              label: 'User',
              render: (value, row) => (
                <div>
                  <Badge variant="gray">{row.nama || value || '-'}</Badge>
                  {row.email && <small className="d-block text-muted mt-1">{row.email}</small>}
                </div>
              ),
            },
            {
              key: 'pelatihan_id',
              label: 'Pelatihan',
            },
            {
              key: 'jumlah_peserta',
              label: 'Peserta',
              render: (value) => `${value || 0} orang`,
            },
            {
              key: 'status',
              label: 'Status',
              render: (value) => <StatusBadge status={String(value || 'pending')} />,
            },
            {
              key: 'created_at',
              label: 'Tanggal',
              render: (value) => (value ? new Date(value).toLocaleDateString('id-ID') : '-'),
            },
            {
              key: 'id',
              label: 'Aksi Status',
              width: '240px',
              render: (_, row) => {
                const isPending = (row.status || 'pending') === 'pending';
                const isUpdating = updatingId === row.id;

                if (!isPending) {
                  return <span className="admin-action-note">Sudah diproses</span>;
                }

                return (
                  <div className="admin-action-group">
                    <button
                      type="button"
                      className="admin-action-btn success"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(row.id, 'diproses')}
                    >
                      <Check size={14} />
                      <span>{isUpdating ? 'Memproses...' : 'Setujui'}</span>
                    </button>
                    <button
                      type="button"
                      className="admin-action-btn danger"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(row.id, 'ditolak')}
                    >
                      <X size={14} />
                      <span>{isUpdating ? 'Memproses...' : 'Tolak'}</span>
                    </button>
                  </div>
                );
              },
            },
          ]}
          data={requests}
          keyExtractor={(row) => row.id}
          isEmpty={requests.length === 0}
          emptyMessage="Belum ada permintaan pelatihan"
        />
      </div>
    </div>
  );
};

export default AdminRequestsList;
