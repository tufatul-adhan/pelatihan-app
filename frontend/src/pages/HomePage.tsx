import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, CalendarClock, CheckCircle2, GraduationCap, Users } from 'lucide-react';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import trainingService from '../services/trainingService';
import { Training } from '../types';
import { companyProfile } from '../content/companyProfile';
import { formatRupiah } from '../utils/currency';
import { publicAsset } from '../utils/publicPath';

const activityPhotos = [
  publicAsset('/assets/kegiatan/kegiatan-01.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-02.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-03.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-04.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-05.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-06.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-07.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-08.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-09.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-10.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-11.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-12.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-13.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-14.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-15.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-16.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-17.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-18.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-19.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-20.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-21.jpeg'),
  publicAsset('/assets/kegiatan/kegiatan-22.jpeg'),
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const activityTrackRef = useRef<HTMLDivElement | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loopedActivityPhotos = useMemo(
    () => [...activityPhotos, ...activityPhotos, ...activityPhotos],
    []
  );

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await trainingService.getTrainings({ forceRefresh: true, limit: 100 });
        setTrainings(data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat pelatihan unggulan');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  useEffect(() => {
    const track = activityTrackRef.current;
    if (!track) return;

    const getSegmentWidth = () => track.scrollWidth / 3;

    const syncToMiddle = () => {
      const segmentWidth = getSegmentWidth();
      if (!segmentWidth) return;
      track.scrollLeft = segmentWidth;
    };

    const normalizeLoopPosition = () => {
      const segmentWidth = getSegmentWidth();
      if (!segmentWidth) return;

      if (track.scrollLeft < segmentWidth * 0.5) {
        track.scrollLeft += segmentWidth;
      } else if (track.scrollLeft > segmentWidth * 1.5) {
        track.scrollLeft -= segmentWidth;
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;

      const canScrollHorizontal = track.scrollWidth > track.clientWidth + 1;
      if (!canScrollHorizontal) return;

      const isHorizontalGesture = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const isShiftWheel = event.shiftKey && event.deltaY !== 0;
      if (!isHorizontalGesture && !isShiftWheel) return;

      const dominantDelta = isShiftWheel ? event.deltaY : event.deltaX;
      if (dominantDelta === 0) return;

      event.preventDefault();
      track.scrollLeft += dominantDelta;
      normalizeLoopPosition();
    };

    const handleScroll = () => {
      normalizeLoopPosition();
    };

    syncToMiddle();

    const images = Array.from(track.querySelectorAll('img'));
    const onImageLoad = () => {
      syncToMiddle();
    };

    images.forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', onImageLoad, { once: true });
    });

    track.addEventListener('wheel', handleWheel, { passive: false });
    track.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', syncToMiddle);

    return () => {
      track.removeEventListener('wheel', handleWheel);
      track.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', syncToMiddle);
      images.forEach((img) => {
        img.removeEventListener('load', onImageLoad);
      });
    };
  }, []);

  const metrics = [
    { number: '16', label: 'Klien tercatat', icon: <Award size={24} /> },
    { number: '5', label: 'Bidang pelatihan', icon: <Users size={24} /> },
    { number: '2', label: 'Layanan utama', icon: <BookOpen size={24} /> },
    { number: '1945', label: 'Nilai kebangsaan', icon: <CheckCircle2 size={24} /> },
  ];

  const strengths = [
    {
      icon: <GraduationCap size={28} />,
      title: 'Disiplin Mental dan Fisik',
      description: 'Program menekankan karakter, mentalitas dasar, etika, dan kesiapan fisik peserta.',
    },
    {
      icon: <BookOpen size={28} />,
      title: 'Wawasan Kebangsaan',
      description: 'Materi menguatkan rasa cinta tanah air dan nilai kebangsaan dalam kegiatan pelatihan.',
    },
    {
      icon: <CalendarClock size={28} />,
      title: 'Pelatihan dan Outbond',
      description: 'Layanan mencakup pelatihan indoor, aktivitas outbond, leadership, dan LDKS.',
    },
  ];

  const programCards = trainings;

  return (
    <>
      <section className="hero-band">
        <div className="hero-mesh" aria-hidden="true">
          <span className="hero-orb hero-orb-a" />
          <span className="hero-orb hero-orb-b" />
          <span className="hero-orb hero-orb-c" />
        </div>
        <div className="container-lg hero-content">
          <div className="row g-5 align-items-center">
            <div className="col-lg-8 animate-fade-in-up">
              <span className="section-eyebrow bg-white bg-opacity-10 text-white mb-4">
                {companyProfile.services.join(' dan ')}
              </span>
              <h1 className="hero-title mb-4">{companyProfile.name}</h1>
              <p className="hero-copy mb-4">
                {companyProfile.tagline} Kami membangun karakter, disiplin,
                leadership, basic mentality, dan wawasan kebangsaan melalui
                pelatihan serta outbond.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Button size="lg" onClick={() => navigate('/pelatihan')}>
                  Lihat Program
                  <ArrowRight size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/form')}
                  className="border-white text-white"
                >
                  Ajukan Pelatihan
                </Button>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="hero-panel rounded-3 p-4 three-d-card">
                <p className="text-white-50 small fw-semibold mb-3">Fokus Layanan</p>
                {companyProfile.programs.map((item) => (
                  <div key={item} className="d-flex align-items-center gap-3 py-3 border-top border-white border-opacity-25">
                    <CheckCircle2 size={20} />
                    <span className="fw-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container-lg">
          <div className="row g-4">
            {metrics.map((metric) => (
              <div className="col-sm-6 col-lg-3" key={metric.label}>
                <div className="metric-card p-4 h-100 three-d-card">
                  <div className="icon-tile mb-3">{metric.icon}</div>
                  <div className="display-6 fw-bold text-dark">{metric.number}</div>
                  <p className="text-muted fw-semibold mb-0">{metric.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section bg-white">
        <div className="container-lg">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <span className="section-eyebrow mb-3">Tentang Kami</span>
              <h2 className="section-title display-6 mb-4">
                Perusahaan pelatihan yang membangun disiplin, mental, etika, dan karakter.
              </h2>
              <p className="section-copy mb-4">
                {companyProfile.history.background}
              </p>
              <div className="row g-3 mb-4">
                {companyProfile.programs.map((item) => (
                  <div className="col-sm-6" key={item}>
                    <div className="d-flex gap-2 align-items-start">
                      <CheckCircle2 className="text-success mt-1" size={18} />
                      <span className="fw-semibold">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => navigate('/tentang-kami')}>
                Profil Perusahaan
                <ArrowRight size={18} />
              </Button>
            </div>
            <div className="col-lg-6">
              <div className="surface-card p-4 p-lg-5 three-d-card">
                <div className="row g-3">
                  {strengths.map((item, index) => (
                    <div className="col-12" key={item.title}>
                      <div className="d-flex gap-3">
                        <div className={`icon-tile ${index === 1 ? 'accent-tile' : index === 2 ? 'cyan-tile' : ''}`}>
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="h5 fw-bold mb-2">{item.title}</h3>
                          <p className="section-copy mb-0">{item.description}</p>
                        </div>
                      </div>
                      {index < strengths.length - 1 && <hr className="my-4" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container-lg">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
            <div>
              <span className="section-eyebrow mb-3">Program Pilihan</span>
              <h2 className="section-title display-6 mb-2">Pelatihan Unggulan</h2>
              <p className="section-copy mb-0">Bidang pelatihan sesuai mockup perusahaan.</p>
            </div>
            <div className="align-self-lg-end">
              <Button variant="outline" onClick={() => navigate('/pelatihan')}>
                Semua Program
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : programCards.length === 0 ? (
            <EmptyState title="Tidak ada pelatihan" description="Belum ada program pelatihan yang tersedia saat ini" />
          ) : (
            <div className="row g-4">
              {programCards.map((training) => (
                <div className="col-md-6 col-lg-4" key={training.id}>
                  <div className="card training-card three-d-card">
                    <div className="training-ribbon d-flex align-items-center justify-content-center text-white">
                      <BookOpen size={34} />
                    </div>
                    <div className="card-body p-4 d-flex flex-column">
                      <h3 className="h5 fw-bold mb-3 line-clamp-2">{training.title}</h3>
                      <p className="section-copy small line-clamp-3 flex-grow-1">{training.description}</p>
                      <div className="d-flex justify-content-between gap-3 border-top pt-3 mb-3">
                        <div>
                          <small className="text-muted d-block">Investasi</small>
                          <strong>{formatRupiah(training.price)}</strong>
                        </div>
                        <div className="text-end">
                          <small className="text-muted d-block">Durasi</small>
                          <strong>{training.duration || 'Fleksibel'}</strong>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => navigate('/form')} className="w-100">
                        Ajukan Sekarang
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="page-section bg-white">
        <div className="container-lg">
          <div className="text-center mb-4">
            <span className="section-eyebrow mb-3">Dokumentasi</span>
            <h2 className="section-title display-6 mb-2">Foto Kegiatan Pelatihan</h2>
            <p className="section-copy mb-0">Dokumentasi kegiatan lapangan, kelas, dan pembinaan peserta.</p>
          </div>

          <div className="activity-gallery-shell">
            <div
              ref={activityTrackRef}
              className="activity-gallery-track"
              role="list"
              aria-label="Galeri kegiatan pelatihan horizontal"
            >
              {loopedActivityPhotos.map((photo, index) => (
                <a
                  key={`${photo}-${index}`}
                  href={photo}
                  target="_blank"
                  rel="noreferrer"
                  className={`activity-gallery-card three-d-card d-block text-decoration-none activity-gallery-tilt-${(index % 3) + 1}`}
                  role="listitem"
                >
                  <img
                    src={photo}
                    alt={`Foto kegiatan pelatihan ${(index % activityPhotos.length) + 1}`}
                    className="activity-gallery-image"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section cta-section text-white">
        <div className="container-lg text-center">
          <span className="section-eyebrow bg-white bg-opacity-10 text-white mb-3">Mulai dari konsultasi</span>
          <h2 className="display-6 fw-bold mb-3">Siap membangun program pelatihan untuk tim Anda?</h2>
          <p className="text-white-50 mx-auto mb-4 content-max-2xl">
            Ceritakan kebutuhan pelatihan, outbond, LDKS, leadership, atau basic mentality.
            Tim kami akan membantu menyesuaikan program dengan kebutuhan instansi Anda.
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
            <Button size="lg" onClick={() => navigate('/form')}>Ajukan Pelatihan</Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/kontak')} className="border-white text-white">
              Hubungi Kami
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
