import React, { useMemo } from 'react';
import { Bar, Doughnut, Line, PolarArea } from 'react-chartjs-2';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import { Permintaan, Training } from '../types';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend
);

interface AdminInsightChartsProps {
  requests: Permintaan[];
  trainings: Training[];
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#f59e0b' },
  diproses: { label: 'Diterima', color: '#0ea5e9' },
  selesai: { label: 'Selesai', color: '#16a34a' },
  ditolak: { label: 'Ditolak', color: '#dc2626' },
  other: { label: 'Lainnya', color: '#8b5cf6' },
};

const normalizeStatus = (status?: string) => {
  const value = (status || '').toLowerCase().trim();
  if (!value) return 'pending';
  if (value === 'approved') return 'diproses';
  if (value === 'completed') return 'selesai';
  if (value === 'rejected' || value === 'cancelled') return 'ditolak';
  if (STATUS_META[value]) return value;
  return 'other';
};

const getMonthKey = (dateValue?: string) => {
  const date = dateValue ? new Date(dateValue) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  return `${safeDate.getFullYear()}-${String(safeDate.getMonth() + 1).padStart(2, '0')}`;
};

const buildRecentMonths = (count: number) => {
  const now = new Date();
  const months: Array<{ key: string; label: string }> = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleString('id-ID', { month: 'short', year: 'numeric' }),
    });
  }
  return months;
};

const AdminInsightCharts: React.FC<AdminInsightChartsProps> = ({ requests, trainings }) => {
  const statusChart = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      diproses: 0,
      selesai: 0,
      ditolak: 0,
      other: 0,
    };

    requests.forEach((request) => {
      const key = normalizeStatus(request.status);
      counts[key] += 1;
    });

    const activeStatuses = Object.entries(counts).filter(([, value]) => value > 0);
    const entries = activeStatuses.length ? activeStatuses : [['pending', 0]];

    return {
      labels: entries.map(([key]) => STATUS_META[key].label),
      data: entries.map(([, value]) => value),
      colors: entries.map(([key]) => STATUS_META[key].color),
    };
  }, [requests]);

  const trendChart = useMemo(() => {
    const months = buildRecentMonths(6);
    const monthIndex = new Map(months.map((month, index) => [month.key, index]));
    const requestCounts = Array.from({ length: months.length }, () => 0);
    const completedCounts = Array.from({ length: months.length }, () => 0);

    requests.forEach((request) => {
      const key = getMonthKey(request.created_at);
      const index = monthIndex.get(key);
      if (typeof index !== 'number') return;

      requestCounts[index] += 1;
      if (normalizeStatus(request.status) === 'selesai') {
        completedCounts[index] += 1;
      }
    });

    return {
      labels: months.map((month) => month.label),
      requestCounts,
      completedCounts,
    };
  }, [requests]);

  const topTrainingChart = useMemo(() => {
    const trainingNameById = new Map<number, string>();
    trainings.forEach((training) => {
      trainingNameById.set(training.id, training.title);
    });

    const counts = new Map<string, number>();
    requests.forEach((request) => {
      const raw = request.pelatihan_id;
      const fallback = 'Tidak diketahui';

      let label = fallback;
      if (typeof raw === 'number') {
        label = trainingNameById.get(raw) || `Pelatihan #${raw}`;
      } else if (typeof raw === 'string') {
        const trimmed = raw.trim();
        const numericId = Number(trimmed);
        if (trimmed && !Number.isNaN(numericId)) {
          label = trainingNameById.get(numericId) || `Pelatihan #${numericId}`;
        } else if (trimmed) {
          label = trimmed;
        }
      }

      counts.set(label, (counts.get(label) || 0) + 1);
    });

    const ranked = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (ranked.length === 0) {
      return { labels: ['Belum ada data'], data: [0] };
    }

    return {
      labels: ranked.map(([label]) => label),
      data: ranked.map(([, value]) => value),
    };
  }, [requests, trainings]);

  const priceTierChart = useMemo(() => {
    const tiers = {
      Konsultasi: 0,
      Basic: 0,
      Standar: 0,
      Premium: 0,
    };

    trainings.forEach((training) => {
      if (!training.price || training.price <= 0) {
        tiers.Konsultasi += 1;
        return;
      }
      if (training.price <= 1000000) {
        tiers.Basic += 1;
        return;
      }
      if (training.price <= 5000000) {
        tiers.Standar += 1;
        return;
      }
      tiers.Premium += 1;
    });

    const labels = Object.keys(tiers);
    const data = Object.values(tiers);

    return {
      labels,
      data,
      colors: ['#0284c7', '#0f766e', '#f59e0b', '#dc2626'],
    };
  }, [trainings]);

  return (
    <div className="row g-4 analytics-grid">
      <div className="col-lg-4">
        <div className="admin-card p-4 h-100">
          <h3 className="h5 fw-bold mb-1">Status Permintaan</h3>
          <p className="section-copy small mb-3">Komposisi status terbaru untuk seluruh permintaan.</p>
          <div className="analytics-chart-shell">
            <Doughnut
              data={{
                labels: statusChart.labels,
                datasets: [
                  {
                    data: statusChart.data,
                    backgroundColor: statusChart.colors,
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
                },
                cutout: '62%',
              }}
            />
          </div>
        </div>
      </div>

      <div className="col-lg-8">
        <div className="admin-card p-4 h-100">
          <h3 className="h5 fw-bold mb-1">Tren 6 Bulan</h3>
          <p className="section-copy small mb-3">Perbandingan jumlah permintaan masuk dan yang selesai.</p>
          <div className="analytics-chart-shell">
            <Line
              data={{
                labels: trendChart.labels,
                datasets: [
                  {
                    label: 'Permintaan',
                    data: trendChart.requestCounts,
                    borderColor: '#0f766e',
                    backgroundColor: 'rgba(15, 118, 110, 0.14)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3,
                  },
                  {
                    label: 'Selesai',
                    data: trendChart.completedCounts,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="col-lg-6">
        <div className="admin-card p-4 h-100">
          <h3 className="h5 fw-bold mb-1">Pelatihan Paling Diminati</h3>
          <p className="section-copy small mb-3">Top 5 pelatihan berdasarkan jumlah permintaan.</p>
          <div className="analytics-chart-shell">
            <Bar
              data={{
                labels: topTrainingChart.labels,
                datasets: [
                  {
                    label: 'Permintaan',
                    data: topTrainingChart.data,
                    backgroundColor: '#0e7490',
                    borderRadius: 8,
                    borderSkipped: false,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="col-lg-6">
        <div className="admin-card p-4 h-100">
          <h3 className="h5 fw-bold mb-1">Sebaran Harga Pelatihan</h3>
          <p className="section-copy small mb-3">Komposisi paket berdasarkan tier investasi program.</p>
          <div className="analytics-chart-shell">
            <PolarArea
              data={{
                labels: priceTierChart.labels,
                datasets: [
                  {
                    data: priceTierChart.data,
                    backgroundColor: priceTierChart.colors.map((color) => `${color}cc`),
                    borderColor: priceTierChart.colors,
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                },
                scales: {
                  r: {
                    ticks: { precision: 0 },
                    grid: { color: 'rgba(100, 116, 139, 0.2)' },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInsightCharts;
