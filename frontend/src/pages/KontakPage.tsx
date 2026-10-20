import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import Button from '../components/Button';
import { companyProfile } from '../content/companyProfile';

const KontakPage: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  const contacts = [
    {
      icon: <MapPin size={26} />,
      title: 'Alamat',
      lines: [companyProfile.address, 'Indonesia'],
    },
    {
      icon: <Phone size={26} />,
      title: 'Telepon',
      lines: ['+62 895 1360 0930'],
      href: 'tel:+6289513600930',
      action: 'Hubungi Sekarang',
    },
    {
      icon: <Mail size={26} />,
      title: 'Email',
      lines: ['indonesiapelatihanunggul@gmail.com'],
      href: 'mailto:indonesiapelatihanunggul@gmail.com',
      action: 'Kirim Email',
    },
  ];

  return (
    <section className="page-section">
      <div className="container-lg">
        <div className="text-center mb-5">
          <span className="section-eyebrow mb-3">Kontak</span>
          <h1 className="section-title display-5 mb-3">Hubungi Kami</h1>
          <p className="section-copy mx-auto mb-0 content-max-xl">
            Diskusikan kebutuhan pelatihan, outbond, leadership, Basic Mentality,
            Karakter Building, atau LDKS bersama tim kami.
          </p>
        </div>

        <div className="row g-4 mb-5">
          {contacts.map((contact, index) => (
            <div className="col-md-4" key={contact.title}>
              <div className="surface-card p-4 h-100 text-center">
                <div className={`icon-tile mx-auto mb-3 ${index === 1 ? 'accent-tile' : index === 2 ? 'cyan-tile' : ''}`}>
                  {contact.icon}
                </div>
                <h2 className="h5 fw-bold">{contact.title}</h2>
                <p className="section-copy mb-3">
                  {contact.lines.map((line) => (
                    <React.Fragment key={line}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
                {contact.href && contact.action && (
                  <a href={contact.href} className="fw-bold text-primary text-decoration-none">
                    {contact.action}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="row g-5 align-items-stretch">
          <div className="col-lg-7">
            <div className="surface-card p-4 p-lg-5 h-100">
              <h2 className="h3 fw-bold mb-4">Kirim pesan langsung</h2>
              {sent && (
                <div className="alert alert-success">
                  Pesan berhasil disiapkan. Tim kami akan segera menindaklanjuti.
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Nama</label>
                    <input type="text" className="form-control" placeholder="Nama Anda" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email</label>
                    <input type="email" className="form-control" placeholder="indonesiapelatihanunggul@gmail.com" required />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Subjek</label>
                    <input type="text" className="form-control" placeholder="Subjek pesan" required />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Pesan</label>
                    <textarea className="form-control" placeholder="Tulis pesan Anda" rows={5} required />
                  </div>
                </div>
                <Button type="submit" className="w-100 mt-4">
                  <Send size={17} />
                  Kirim Pesan
                </Button>
              </form>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="map-panel h-100 d-flex align-items-center justify-content-center p-4 text-center">
              <div>
                <MapPin size={48} className="text-primary mb-3" />
                <h2 className="h4 fw-bold">Bojong Gede, Kab. Bogor</h2>
                <p className="section-copy mb-0">
                  Alamat perusahaan: {companyProfile.address}. Area layanan mencakup
                  pelatihan dan outbond untuk perusahaan, sekolah, ASN, serta instansi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KontakPage;
