import React, { useMemo, useState } from 'react';
import { Download, Filter, X, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Permintaan, Training } from '../../types';

interface AdminOperationalReportProps {
  requests: Permintaan[];
  trainings: Training[];
  onToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

type StatusFilter = 'semua' | 'pending' | 'diproses' | 'ditolak' | 'selesai';
type DateRangeType = 'all' | '7' | '30' | '90' | 'custom';

const AdminOperationalReport: React.FC<AdminOperationalReportProps> = ({
  requests,
  trainings,
  onToast,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('semua');
  const [dateRange, setDateRange] = useState<DateRangeType>('30');
  const [searchTerm, setSearchTerm] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Format date helper
  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (date: string | undefined) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  // Filter requests based on criteria
  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    // Status filter
    if (statusFilter !== 'semua') {
      filtered = filtered.filter(
        (r) => (r.status || 'pending').toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Date range filter
    if (dateRange === 'custom' && (customStartDate || customEndDate)) {
      const startDate = customStartDate ? new Date(customStartDate) : new Date('1970-01-01');
      const endDate = customEndDate ? new Date(customEndDate) : new Date();
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((r) => {
        if (!r.created_at) return false;
        const date = new Date(r.created_at);
        return date >= startDate && date <= endDate;
      });
    } else if (dateRange !== 'all') {
      const days = Number(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      cutoff.setHours(0, 0, 0, 0);

      filtered = filtered.filter((r) => {
        if (!r.created_at) return false;
        const date = new Date(r.created_at);
        return date >= cutoff;
      });
    }

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          (r.nama || '').toLowerCase().includes(search) ||
          (r.email || '').toLowerCase().includes(search)
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
  }, [requests, statusFilter, dateRange, searchTerm, customStartDate, customEndDate]);

  // Group requests by day
  const requestsByDay = useMemo(() => {
    const grouped: Record<string, Permintaan[]> = {};

    filteredRequests.forEach((request) => {
      if (!request.created_at) return;
      const date = new Date(request.created_at);
      const key = date.toISOString().split('T')[0];
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(request);
    });

    return Object.entries(grouped)
      .map(([date, items]) => ({ date, items }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredRequests]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredRequests.length;
    const pending = filteredRequests.filter((r) => (r.status || 'pending') === 'pending').length;
    const diproses = filteredRequests.filter((r) => r.status === 'diproses').length;
    const ditolak = filteredRequests.filter((r) => r.status === 'ditolak').length;
    const selesai = filteredRequests.filter((r) => r.status === 'selesai').length;

    return { total, pending, diproses, ditolak, selesai };
  }, [filteredRequests]);

  // Get training name by ID
  const getTrainingName = (trainingId: number | string | undefined) => {
    if (!trainingId) return '-';
    const trainingIdText = String(trainingId).trim();
    const training = trainings.find((t) => String(t.id) === trainingIdText);
    return training?.title || trainingIdText;
  };

  // Export to XLSX
  const handleExportXlsx = () => {
    if (filteredRequests.length === 0) {
      onToast('Tidak ada data untuk diekspor', 'warning');
      return;
    }

    const rows = filteredRequests.map((request) => ({
      'No. ID': request.id,
      'Nama Pemohon': request.nama || '-',
      'Email': request.email || '-',
      'Program Pelatihan': getTrainingName(request.pelatihan_id),
      'Jumlah Peserta': request.jumlah_peserta || 0,
      'Status': request.status || 'pending',
      'Tanggal Permintaan': formatDate(request.created_at),
      'Waktu Permintaan': formatDateTime(request.created_at),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Operasional');

    const filename = `laporan-operasional-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, filename);

    onToast('Laporan XLSX berhasil diunduh', 'success');
  };

  // Export to PDF
  const handleExportPdf = () => {
    if (filteredRequests.length === 0) {
      onToast('Tidak ada data untuk diekspor', 'warning');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFontSize(16);
    doc.text('LAPORAN OPERASIONAL PERMINTAAN PELATIHAN', 14, 15);

    // Filter info
    doc.setFontSize(10);
    let filterInfo = `Status: ${statusFilter} | `;
    if (dateRange === 'custom') {
      filterInfo += `Tanggal: ${customStartDate} hingga ${customEndDate}`;
    } else if (dateRange === 'all') {
      filterInfo += `Periode: Semua Data`;
    } else {
      filterInfo += `Periode: ${dateRange} Hari Terakhir`;
    }
    if (searchTerm) {
      filterInfo += ` | Pencarian: "${searchTerm}"`;
    }
    doc.text(filterInfo, 14, 22);

    // Export date
    doc.setFontSize(9);
    doc.text(`Diekspor pada: ${new Date().toLocaleString('id-ID')}`, 14, 28);

    // Table
    const rows = filteredRequests.map((request) => [
      request.id.toString(),
      request.nama || '-',
      request.email || '-',
      getTrainingName(request.pelatihan_id),
      (request.jumlah_peserta || 0).toString(),
      request.status || 'pending',
      formatDate(request.created_at),
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['ID', 'Nama', 'Email', 'Program Pelatihan', 'Peserta', 'Status', 'Tanggal']],
      body: rows,
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [15, 93, 183],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      bodyStyles: {
        textColor: 0,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        4: { halign: 'center', cellWidth: 15 },
        6: { halign: 'center', cellWidth: 20 },
      },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY || 50;
    doc.setFontSize(9);
    doc.text(`Total Data: ${filteredRequests.length}`, 14, Math.min(finalY + 10, pageHeight - 10));

    const filename = `laporan-operasional-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);

    onToast('Laporan PDF berhasil diunduh', 'success');
  };

  // Export per day
  const handleExportDayXlsx = (day: string, dayRequests: Permintaan[]) => {
    if (dayRequests.length === 0) {
      onToast('Tidak ada data untuk diekspor', 'warning');
      return;
    }

    const rows = dayRequests.map((request) => ({
      'No. ID': request.id,
      'Nama Pemohon': request.nama || '-',
      'Email': request.email || '-',
      'Program Pelatihan': getTrainingName(request.pelatihan_id),
      'Jumlah Peserta': request.jumlah_peserta || 0,
      'Status': request.status || 'pending',
      'Waktu': formatDateTime(request.created_at),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Harian');

    const filename = `laporan-harian-${day}.xlsx`;
    XLSX.writeFile(workbook, filename);

    onToast(`Laporan harian ${day} berhasil diunduh`, 'success');
  };

  // Export per day PDF
  const handleExportDayPdf = (day: string, dayRequests: Permintaan[]) => {
    if (dayRequests.length === 0) {
      onToast('Tidak ada data untuk diekspor', 'warning');
      return;
    }

    const doc = new jsPDF();

    // Header
    doc.setFontSize(14);
    doc.text('LAPORAN HARIAN PERMINTAAN PELATIHAN', 14, 15);

    // Date
    doc.setFontSize(11);
    doc.text(`Tanggal: ${formatDate(day)}`, 14, 22);

    // Export date
    doc.setFontSize(9);
    doc.text(`Diekspor pada: ${new Date().toLocaleString('id-ID')}`, 14, 27);

    // Table
    const rows = dayRequests.map((request) => [
      request.id.toString(),
      request.nama || '-',
      request.email || '-',
      getTrainingName(request.pelatihan_id),
      (request.jumlah_peserta || 0).toString(),
      request.status || 'pending',
      formatDateTime(request.created_at),
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['ID', 'Nama', 'Email', 'Program Pelatihan', 'Peserta', 'Status', 'Waktu']],
      body: rows,
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [15, 93, 183],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      bodyStyles: {
        textColor: 0,
      },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY || 50;
    doc.setFontSize(9);
    doc.text(`Total Data: ${dayRequests.length}`, 14, Math.min(finalY + 8, 280));

    const filename = `laporan-harian-${day}.pdf`;
    doc.save(filename);

    onToast(`Laporan harian ${day} (PDF) berhasil diunduh`, 'success');
  };

  // Status badge color
  const getStatusColor = (status?: string) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'pending':
        return 'warning';
      case 'diproses':
        return 'info';
      case 'ditolak':
        return 'danger';
      case 'selesai':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status?: string) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'pending':
        return 'Menunggu';
      case 'diproses':
        return 'Diproses';
      case 'ditolak':
        return 'Ditolak';
      case 'selesai':
        return 'Selesai';
      default:
        return status || 'Pending';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-card p-4 mb-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
          <div>
            <h2 className="h4 fw-bold mb-1">Laporan Operasional</h2>
            <p className="text-muted mb-0">
              Filter data, pantau status, lalu unduh laporan XLSX atau PDF kapan saja
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              onClick={handleExportXlsx}
              disabled={filteredRequests.length === 0}
              className="btn btn-primary d-inline-flex align-items-center gap-2"
              title="Export semua data terfilter ke XLSX"
            >
              <Download size={16} />
              Export XLSX
            </button>
            <button
              onClick={handleExportPdf}
              disabled={filteredRequests.length === 0}
              className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
              title="Export semua data terfilter ke PDF"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="row g-3">
          <div className="col-md-3 col-sm-6">
            <div className="stat-card bg-primary-soft">
              <small className="d-block text-muted fw-500 mb-1">Total Permintaan</small>
              <h3 className="fw-bold mb-0" style={{ fontSize: '1.8rem' }}>
                {stats.total}
              </h3>
              <small className="text-muted">Data sesuai filter</small>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stat-card bg-warning-soft">
              <small className="d-block text-muted fw-500 mb-1">Menunggu Proses</small>
              <h3 className="fw-bold mb-0" style={{ fontSize: '1.8rem' }}>
                {stats.pending}
              </h3>
              <small className="text-muted">Status: Pending</small>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stat-card bg-info-soft">
              <small className="d-block text-muted fw-500 mb-1">Sedang Diproses</small>
              <h3 className="fw-bold mb-0" style={{ fontSize: '1.8rem' }}>
                {stats.diproses}
              </h3>
              <small className="text-muted">Status: Diproses</small>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stat-card bg-success-soft">
              <small className="d-block text-muted fw-500 mb-1">Selesai</small>
              <h3 className="fw-bold mb-0" style={{ fontSize: '1.8rem' }}>
                {stats.selesai}
              </h3>
              <small className="text-muted">Status: Selesai</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card p-4 mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} />
          <h5 className="mb-0 fw-bold">Filter & Pencarian</h5>
        </div>

        <div className="row g-3">
          {/* Search */}
          <div className="col-md-4">
            <label htmlFor="searchInput" className="form-label fw-500">
              Cari Nama atau Email
            </label>
            <input
              id="searchInput"
              type="text"
              className="form-control"
              placeholder="Masukkan nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="col-md-4">
            <label htmlFor="statusFilter" className="form-label fw-500">
              Filter Status
            </label>
            <select
              id="statusFilter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="semua">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="diproses">Diproses</option>
              <option value="ditolak">Ditolak</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="col-md-4">
            <label htmlFor="dateRange" className="form-label fw-500">
              Periode
            </label>
            <select
              id="dateRange"
              className="form-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeType)}
            >
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
              <option value="90">90 Hari Terakhir</option>
              <option value="all">Semua Data</option>
              <option value="custom">Tanggal Kustom</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <>
              <div className="col-md-4">
                <label htmlFor="startDate" className="form-label fw-500">
                  Tanggal Mulai
                </label>
                <input
                  id="startDate"
                  type="date"
                  className="form-control"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="endDate" className="form-label fw-500">
                  Tanggal Akhir
                </label>
                <input
                  id="endDate"
                  type="date"
                  className="form-control"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                    setDateRange('30');
                  }}
                  className="btn btn-outline-secondary w-100"
                >
                  Reset Tanggal
                </button>
              </div>
            </>
          )}
        </div>

        {/* Filter Info */}
        <div className="mt-3 pt-3 border-top">
          <small className="text-muted">
            <strong>Total hasil filter:</strong> {filteredRequests.length} data
            {searchTerm && ` (mencari: "${searchTerm}")`}
            {statusFilter !== 'semua' && ` (status: ${statusFilter})`}
          </small>
        </div>
      </div>

      {/* Daily Reports */}
      {requestsByDay.length > 0 ? (
        <div>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Calendar size={18} />
            <h5 className="mb-0 fw-bold">Laporan Harian</h5>
          </div>

          <div className="row g-3">
            {requestsByDay.map(({ date, items }) => (
              <div key={date} className="col-12">
                <div className="admin-card p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="fw-bold mb-1">{formatDate(date)}</h6>
                      <small className="text-muted">{items.length} permintaan</small>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => handleExportDayXlsx(date, items)}
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                        title={`Export ${date} ke XLSX`}
                      >
                        <Download size={14} />
                        XLSX
                      </button>
                      <button
                        onClick={() => handleExportDayPdf(date, items)}
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                        title={`Export ${date} ke PDF`}
                      >
                        <Download size={14} />
                        PDF
                      </button>
                      <button
                        onClick={() => setSelectedDay(selectedDay === date ? null : date)}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        {selectedDay === date ? <X size={14} /> : 'Detail'}
                      </button>
                    </div>
                  </div>

                  {/* Daily Detail */}
                  {selectedDay === date && (
                    <div className="table-responsive border-top pt-3 mt-3">
                      <table className="table table-sm mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '50px' }}>ID</th>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>Program Pelatihan</th>
                            <th style={{ width: '80px' }}>Peserta</th>
                            <th style={{ width: '100px' }}>Status</th>
                            <th>Waktu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((request) => (
                            <tr key={request.id}>
                              <td className="fw-500">{request.id}</td>
                              <td>{request.nama || '-'}</td>
                              <td>
                                <small>{request.email || '-'}</small>
                              </td>
                              <td>
                                <small>{getTrainingName(request.pelatihan_id)}</small>
                              </td>
                              <td className="text-center">{request.jumlah_peserta || 0}</td>
                              <td>
                                <span
                                  className={`badge bg-${getStatusColor(request.status)}`}
                                >
                                  {getStatusLabel(request.status)}
                                </span>
                              </td>
                              <td>
                                <small>{formatDateTime(request.created_at)}</small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="admin-card p-5 text-center">
          <p className="text-muted mb-0">
            Tidak ada data sesuai dengan filter yang Anda pilih
          </p>
        </div>
      )}

      <style>{`
        .stat-card {
          padding: 1.25rem;
          border-radius: 0.75rem;
          border-left: 4px solid #0f5db7;
        }

        .bg-primary-soft {
          background-color: rgba(15, 93, 183, 0.1);
        }

        .bg-warning-soft {
          background-color: rgba(255, 193, 7, 0.1);
        }

        .bg-info-soft {
          background-color: rgba(23, 162, 184, 0.1);
        }

        .bg-success-soft {
          background-color: rgba(40, 167, 69, 0.1);
        }

        .admin-card {
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e9ecef;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }

        .admin-card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AdminOperationalReport;
