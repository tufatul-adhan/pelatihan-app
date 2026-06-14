import React, { useEffect, useState } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import { Button, Input, TextArea } from '../../components';
import { trainingService } from '../../services';
import { Training } from '../../types';
import { formatRupiah, toPriceNumber } from '../../utils/currency';

interface AdminTrainingFormProps {
  training?: Training | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminTrainingForm: React.FC<AdminTrainingFormProps> = ({
  training,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
  });

  useEffect(() => {
    if (training) {
      setFormData({
        title: training.title || '',
        description: training.description || '',
        price: training.price ? String(toPriceNumber(training.price)) : '',
        duration: training.duration || '',
      });
    }
  }, [training]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Nama pelatihan wajib diisi';
    if (!formData.description.trim()) newErrors.description = 'Deskripsi wajib diisi';
    const priceValue = toPriceNumber(formData.price);
    if (!formData.price) {
      newErrors.price = 'Harga wajib diisi';
    } else if (priceValue <= 0) {
      newErrors.price = 'Harga harus berupa angka positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      title: formData.title,
      description: formData.description,
      price: toPriceNumber(formData.price),
      duration: formData.duration,
      createdAt: training?.createdAt,
    };

    try {
      setIsLoading(true);
      if (training) {
        await trainingService.updateTraining(training.id, payload);
      } else {
        await trainingService.createTraining(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save training:', error);
      setErrors({ submit: 'Gagal menyimpan pelatihan. Silakan coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'price') {
      const digitsOnly = value.replace(/[^\d]/g, '');
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div>
      <button
        onClick={onClose}
        className="btn btn-link text-decoration-none px-0 d-inline-flex align-items-center gap-2 mb-3"
      >
        <ChevronLeft size={18} />
        Kembali
      </button>

      <div className="mb-4">
        <h1 className="h2 fw-bold mb-1">{training ? 'Edit Pelatihan' : 'Tambah Pelatihan Baru'}</h1>
        <p className="section-copy mb-0">
          {training ? 'Ubah informasi pelatihan yang ada.' : 'Buat program pelatihan baru untuk katalog.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="admin-card p-4 p-lg-5">
        {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

        <Input
          label="Nama Pelatihan"
          name="title"
          placeholder="Masukkan nama pelatihan"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
        />

        <TextArea
          label="Deskripsi"
          name="description"
          placeholder="Masukkan deskripsi pelatihan"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          required
          rows={5}
        />

        <div className="row g-3">
          <div className="col-md-6">
            <Input
              label="Harga (Rp)"
              name="price"
              type="text"
              placeholder="Contoh: 1.500.000"
              value={formData.price ? formatRupiah(formData.price, { withPrefix: false, emptyLabel: '' }) : ''}
              onChange={handleChange}
              error={errors.price}
              required
            />
          </div>
          <div className="col-md-6">
            <Input
              label="Durasi"
              name="duration"
              placeholder="Contoh: 2 Hari"
              value={formData.duration}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="d-flex flex-column flex-sm-row gap-3 pt-4 mt-2 border-top">
          <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            <Save size={17} />
            {training ? 'Simpan Perubahan' : 'Tambah Pelatihan'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminTrainingForm;
