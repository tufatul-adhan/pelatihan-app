import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import Input from '../components/Input';
import Select from '../components/Select';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Notification, Training, TrainingRequest } from '../types';
import trainingService from '../services/trainingService';
import requestService from '../services/requestService';

const RequestFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<TrainingRequest>({
    nama: '',
    email: '',
    perusahaan: '',
    pelatihan: '',
    tanggal: '',
    jumlahPeserta: 1,
    deskripsi: '',
  });

  const showNotification = useCallback(
    (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
      setNotification({ id: Date.now().toString(), type, message, duration: 5000 });
    },
    []
  );

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const data = await trainingService.getTrainings();
        setTrainings(data);
      } catch (err) {
        console.error(err);
        showNotification('error', 'Gagal memuat pilihan pelatihan');
      }
    };

    fetchTrainings();
  }, [showNotification]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama.trim()) newErrors.nama = 'Nama harus diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.perusahaan.trim()) newErrors.perusahaan = 'Nama perusahaan harus diisi';
    if (!formData.pelatihan) newErrors.pelatihan = 'Pilih pelatihan yang diinginkan';
    if (!formData.tanggal) newErrors.tanggal = 'Tanggal pelaksanaan harus diisi';
    if (formData.jumlahPeserta < 1) newErrors.jumlahPeserta = 'Jumlah peserta minimal 1';
    if (!formData.deskripsi.trim()) newErrors.deskripsi = 'Deskripsi harus diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'jumlahPeserta' ? parseInt(value, 10) || 0 : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification('error', 'Silakan lengkapi data yang diperlukan');
      return;
    }

    try {
      setLoading(true);
      await requestService.submitRequest(formData);
      setSubmitted(true);
      showNotification('success', 'Permintaan pelatihan berhasil diajukan');
      setFormData({
        nama: '',
        email: '',
        perusahaan: '',
        pelatihan: '',
        tanggal: '',
        jumlahPeserta: 1,
        deskripsi: '',
      });
    } catch (err) {
      console.error(err);
      showNotification('error', 'Gagal mengajukan permintaan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="container-lg">
        <div className="row g-5 align-items-start">
          <div className="col-lg-5">
            <span className="section-eyebrow mb-3">Form Permintaan</span>
            <h1 className="section-title display-6 mb-3">Ajukan pelatihan untuk perusahaan Anda</h1>
            <p className="section-copy mb-4">
              Isi kebutuhan tim Anda. Kami akan meninjau detailnya dan menghubungi Anda
              untuk rekomendasi format, jadwal, dan estimasi program.
            </p>
            <div className="surface-card p-4">
              {['Respons maksimal 24 jam kerja', 'Konsultasi kebutuhan tanpa biaya', 'Program dapat disesuaikan'].map((item) => (
                <div className="d-flex gap-3 align-items-start py-2" key={item}>
                  <CheckCircle2 className="text-success mt-1" size={18} />
                  <span className="fw-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-7">
            <div className="surface-card p-4 p-lg-5">
              {submitted ? (
                <div className="text-center py-5">
                  <CheckCircle2 className="text-success mb-3" size={64} />
                  <h2 className="h3 fw-bold mb-2">Permintaan Berhasil Diajukan</h2>
                  <p className="section-copy mb-4">
                    Terima kasih. Tim kami akan menghubungi Anda untuk langkah berikutnya.
                  </p>
                  <Button onClick={() => navigate('/')}>Kembali ke Beranda</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <Input
                        label="Nama Lengkap"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        error={errors.nama}
                        required
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                        placeholder="indonesiapelatihanunggul@gmail.com"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Nama Perusahaan"
                        name="perusahaan"
                        value={formData.perusahaan}
                        onChange={handleChange}
                        error={errors.perusahaan}
                        required
                        placeholder="Nama perusahaan"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Tanggal Pelaksanaan"
                        name="tanggal"
                        type="date"
                        value={formData.tanggal}
                        onChange={handleChange}
                        error={errors.tanggal}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Jumlah Peserta"
                        name="jumlahPeserta"
                        type="number"
                        value={formData.jumlahPeserta}
                        onChange={handleChange}
                        error={errors.jumlahPeserta}
                        min="1"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <Select
                        label="Pilih Pelatihan"
                        name="pelatihan"
                        value={formData.pelatihan}
                        onChange={handleChange}
                        error={errors.pelatihan}
                        options={trainings.map((t) => ({
                          value: t.id.toString(),
                          label: t.title,
                        }))}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <TextArea
                        label="Deskripsi Kebutuhan"
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleChange}
                        error={errors.deskripsi}
                        required
                        rows={5}
                        placeholder="Jelaskan tujuan pelatihan, tantangan tim, atau jadwal yang diinginkan"
                      />
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                    <Button variant="outline" type="button" onClick={() => navigate('/')} className="flex-fill">
                      <ArrowLeft size={17} />
                      Batal
                    </Button>
                    <Button type="submit" loading={loading} className="flex-fill">
                      <Send size={17} />
                      Ajukan Permintaan
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Alert notification={notification} onClose={() => setNotification(null)} />
    </section>
  );
};

export default RequestFormPage;
