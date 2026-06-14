import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import trainingService from '../services/trainingService';
import { Training } from '../types';
import { formatRupiah } from '../utils/currency';

const TrainingListPage: React.FC = () => {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await trainingService.getTrainings({ forceRefresh: true, limit: 100 });
        setTrainings(data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat pelatihan');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const filteredTrainings = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    if (!keyword) return trainings;

    return trainings.filter(
      (training) =>
        training.title.toLowerCase().includes(keyword) ||
        training.description.toLowerCase().includes(keyword)
    );
  }, [searchTerm, trainings]);

  return (
    <>
      <section className="page-section pb-4">
        <div className="container-lg">
          <div className="row g-4 align-items-end">
            <div className="col-lg-7">
              <span className="section-eyebrow mb-3">Katalog Pelatihan</span>
              <h1 className="section-title display-5 mb-3">Program pelatihan dan outbond</h1>
              <p className="section-copy mb-0">
                Pilih bidang pelatihan yang sesuai.
              </p>
            </div>
            <div className="col-lg-5">
              <div className="input-group input-group-lg shadow-sm">
                <span className="input-group-text bg-white border-end-0">
                  <Search size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  placeholder="Cari pelatihan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control border-start-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section pt-4">
        <div className="container-lg">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : filteredTrainings.length === 0 ? (
            <EmptyState
              title="Tidak ada pelatihan"
              description={
                searchTerm
                  ? 'Tidak ada pelatihan yang sesuai dengan pencarian Anda'
                  : 'Belum ada program pelatihan yang tersedia saat ini'
              }
            />
          ) : (
            <div className="row g-4">
              {filteredTrainings.map((training) => (
                <div className="col-md-6 col-lg-4" key={training.id}>
                  <div className="card training-card">
                    <div className="training-ribbon d-flex align-items-center justify-content-center text-white">
                      <BookOpen size={34} />
                    </div>
                    <div className="card-body p-4 d-flex flex-column">
                      <h2 className="h5 fw-bold mb-3 line-clamp-2">{training.title}</h2>
                      <p className="section-copy small line-clamp-3 flex-grow-1">{training.description}</p>
                      <div className="border-top pt-3 mb-3">
                        <div className="d-flex justify-content-between gap-3">
                          <div>
                            <small className="text-muted d-block">Durasi</small>
                            <strong>{training.duration || 'Fleksibel'}</strong>
                          </div>
                          <div className="text-end">
                            <small className="text-muted d-block">Investasi</small>
                            <strong>
                              {formatRupiah(training.price)}
                            </strong>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => navigate('/form')} className="w-100">
                        Ajukan
                        <ArrowRight size={17} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && (
            <p className="text-center text-muted mt-5 mb-0">
              Menampilkan {filteredTrainings.length} program
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default TrainingListPage;
