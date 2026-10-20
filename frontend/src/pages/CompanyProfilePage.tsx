import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Lightbulb, Target, Users } from 'lucide-react';
import Button from '../components/Button';
import { companyProfile } from '../content/companyProfile';

const CompanyProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: <BadgeCheck size={26} />,
      title: 'Integritas',
      description: 'Bekerja transparan, bertanggung jawab, dan menjaga kepercayaan klien.',
    },
    {
      icon: <BriefcaseBusiness size={26} />,
      title: 'Profesionalisme',
      description: 'Standar layanan rapi dari perencanaan, pelaksanaan, sampai evaluasi.',
    },
    {
      icon: <Lightbulb size={26} />,
      title: 'Inovasi',
      description: 'Metode belajar terus diperbarui agar relevan dengan perubahan industri.',
    },
    {
      icon: <Target size={26} />,
      title: 'Dampak Terukur',
      description: 'Setiap program diarahkan pada perubahan kompetensi yang jelas.',
    },
  ];

  return (
    <>
      <section className="page-section pb-4">
        <div className="container-lg">
          <div className="row g-5 align-items-center">
            <div className="col-lg-7">
              <span className="section-eyebrow mb-3">Profil Perusahaan</span>
              <h1 className="section-title display-5 mb-3">{companyProfile.name}</h1>
              <p className="section-copy fs-5 mb-4">
                {companyProfile.tagline} Bergerak di bidang {companyProfile.services.join(' dan ')}
                untuk karyawan, pelajar, ASN, dan instansi.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Button onClick={() => navigate('/pelatihan')}>
                  Lihat Program
                  <ArrowRight size={18} />
                </Button>
                <Button variant="outline" onClick={() => navigate('/kontak')}>
                  Hubungi Kami
                </Button>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="surface-card p-4 p-lg-5">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="icon-tile">
                    <Users size={26} />
                  </div>
                  <div>
                    <div className="h2 fw-bold mb-0">{companyProfile.clients.length}</div>
                  </div>
                </div>
                <p className="section-copy mb-0">
                  Beralamat di {companyProfile.address}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container-lg">
          <div className="row g-5 align-items-start">
            <div className="col-lg-6">
              <h2 className="section-title h1 mb-3">Visi dan misi perusahaan</h2>
              <div className="surface-card p-4 mb-3">
                <h3 className="h5 fw-bold">Visi</h3>
                <p className="section-copy mb-0">{companyProfile.vision}</p>
              </div>
              <div className="surface-card p-4">
                <h3 className="h5 fw-bold">Misi</h3>
                <ul className="section-copy mb-0 ps-3">
                  {companyProfile.missions.map((mission) => (
                    <li className="mb-2" key={mission}>{mission}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row g-3">
                {values.map((value, index) => (
                  <div className="col-sm-6" key={value.title}>
                    <div className="surface-card p-4 h-100">
                      <div className={`icon-tile mb-3 ${index === 1 ? 'cyan-tile' : index === 2 ? 'accent-tile' : ''}`}>
                        {value.icon}
                      </div>
                      <h3 className="h5 fw-bold">{value.title}</h3>
                      <p className="section-copy small mb-0">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section bg-white">
        <div className="container-lg">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5">
              <span className="section-eyebrow mb-3">Layanan & Program</span>
              <h2 className="section-title h1 mb-3">Pelatihan dan outbond sesuai kebutuhan peserta</h2>
              <p className="section-copy mb-0">
                Bidang pelatihan dalam mockup meliputi karakter, mentalitas dasar,
                kepemimpinan, outbond, dan LDKS.
              </p>
            </div>
            <div className="col-lg-7">
              <div className="row g-3">
                {companyProfile.programs.map((service) => (
                  <div className="col-md-6" key={service}>
                    <div className="surface-card p-4 d-flex align-items-center gap-3 h-100">
                      <BadgeCheck className="text-success" size={22} />
                      <span className="fw-bold">{service}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container-lg">
          <div className="row g-5 align-items-start">
            <div className="col-lg-6">
              <span className="section-eyebrow mb-3">Sejarah Perusahaan</span>
              <h2 className="section-title h1 mb-3">Latar belakang dan tujuan</h2>
              <div className="surface-card p-4 mb-3">
                <h3 className="h5 fw-bold">Latar Belakang</h3>
                <p className="section-copy mb-0">{companyProfile.history.background}</p>
              </div>
              <div className="surface-card p-4">
                <h3 className="h5 fw-bold">Tujuan</h3>
                <p className="section-copy mb-0">{companyProfile.history.purpose}</p>
              </div>
            </div>
            <div className="col-lg-6">
              <span className="section-eyebrow mb-3">Struktur BOD</span>
              <h2 className="section-title h1 mb-3">Susunan organisasi</h2>
              <div className="row g-3">
                {companyProfile.board.map((person) => (
                  <div className="col-md-6" key={person.role}>
                    <div className="surface-card p-4 h-100">
                      <p className="text-muted small fw-semibold mb-2">{person.role}</p>
                      <h3 className="h6 fw-bold mb-0">{person.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section stats-band text-white">
        <div className="container-lg">
          <div className="row g-4 text-center">
            {[
              [String(companyProfile.clients.length), 'Klien tercatat'],
              [String(companyProfile.programs.length), 'Bidang pelatihan'],
              [String(companyProfile.board.length), 'Struktur BOD'],
              [String(companyProfile.services.length), 'Layanan utama'],
            ].map(([number, label]) => (
              <div className="col-6 col-lg-3" key={label}>
                <div className="display-5 fw-bold">{number}</div>
                <p className="text-white-50 mb-0 fw-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section bg-white">
        <div className="container-lg">
          <div className="text-center mb-5">
            <span className="section-eyebrow mb-3">Daftar Klien</span>
            <h2 className="section-title display-6 mb-3">Instansi dan perusahaan klien</h2>
            <p className="section-copy mx-auto mb-0 content-max-2xl">
              Daftar klien disesuaikan dengan data mockup.
            </p>
          </div>
          <div className="row g-3">
            {companyProfile.clients.map((client, index) => (
              <div className="col-md-6 col-lg-4" key={client}>
                <div className="surface-card p-3 h-100 d-flex gap-3 align-items-start">
                  <span className="badge bg-primary-subtle text-primary">{index + 1}</span>
                  <span className="fw-semibold">{client}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container-lg text-center">
          <h2 className="section-title display-6 mb-3">Siap meningkatkan kompetensi tim?</h2>
          <p className="section-copy mx-auto mb-4 content-max-xl">
            Dapatkan rekomendasi pelatihan atau outbond sesuai kebutuhan organisasi Anda.
          </p>
          <Button size="lg" onClick={() => navigate('/form')}>
            Ajukan Pelatihan
            <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </>
  );
};

export default CompanyProfilePage;
