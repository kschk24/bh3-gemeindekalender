import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { eventsService, categoriesService } from '../../services/api';
import { Event } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEvent?: Event;
}

interface FormState {
  title: string;
  description: string;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  categoryId: string;
  imageUrl: string;
  requiresAccount: boolean;
  maxParticipants: string;
  wheelchairAccessible: boolean;
  hearingLoop: boolean;
  signLanguage: boolean;
  easyLanguage: boolean;
}

function toLocalDatetime(isoString: string) {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventFormModal({ isOpen, onClose, initialEvent }: EventFormModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = !!initialEvent;

  const emptyForm: FormState = {
    title: '',
    description: '',
    location: '',
    address: '',
    startDate: '',
    endDate: '',
    categoryId: '',
    imageUrl: '',
    requiresAccount: false,
    maxParticipants: '',
    wheelchairAccessible: false,
    hearingLoop: false,
    signLanguage: false,
    easyLanguage: false,
  };

  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (initialEvent) {
      setForm({
        title: initialEvent.title,
        description: initialEvent.description,
        location: initialEvent.location,
        address: initialEvent.address,
        startDate: toLocalDatetime(initialEvent.startDate),
        endDate: toLocalDatetime(initialEvent.endDate),
        categoryId: initialEvent.categoryId,
        imageUrl: initialEvent.imageUrl || '',
        requiresAccount: initialEvent.requiresAccount,
        maxParticipants: initialEvent.maxParticipants ? String(initialEvent.maxParticipants) : '',
        wheelchairAccessible: initialEvent.accessibility?.wheelchairAccessible ?? false,
        hearingLoop: initialEvent.accessibility?.hearingLoop ?? false,
        signLanguage: initialEvent.accessibility?.signLanguage ?? false,
        easyLanguage: initialEvent.accessibility?.easyLanguage ?? false,
      });
    } else {
      setForm(emptyForm);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEvent, isOpen]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        address: form.address,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        categoryId: form.categoryId,
        imageUrl: form.imageUrl || undefined,
        requiresAccount: form.requiresAccount,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
        createdBy: '',
        accessibility: {
          wheelchairAccessible: form.wheelchairAccessible,
          hearingLoop: form.hearingLoop,
          signLanguage: form.signLanguage,
          easyLanguage: form.easyLanguage,
        },
      };
      if (isEdit) {
        return eventsService.update(initialEvent!.id, payload);
      }
      return eventsService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(isEdit ? t('eventForm.editSuccess') : t('eventForm.createSuccess'));
      onClose();
    },
    onError: () => {
      toast.error(t('error.generic'));
    },
  });

  const set = <K extends keyof FormState>(key: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const el = e.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [key]: el.type === 'checkbox' ? el.checked : el.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('eventForm.editTitle') : t('eventForm.createTitle')}
      titleId="event-form-title"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="ef-title" className={labelClass}>{t('eventForm.title')} *</label>
          <Input id="ef-title" value={form.title} onChange={set('title')} required />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="ef-desc" className={labelClass}>{t('eventForm.description')} *</label>
          <textarea
            id="ef-desc"
            value={form.description}
            onChange={set('description')}
            required
            rows={3}
            className={inputClass}
          />
        </div>

        {/* Location + Address */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ef-location" className={labelClass}>{t('eventForm.location')} *</label>
            <Input id="ef-location" value={form.location} onChange={set('location')} required />
          </div>
          <div>
            <label htmlFor="ef-address" className={labelClass}>{t('eventForm.address')} *</label>
            <Input id="ef-address" value={form.address} onChange={set('address')} required />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ef-start" className={labelClass}>{t('eventForm.startDate')} *</label>
            <input id="ef-start" type="datetime-local" value={form.startDate} onChange={set('startDate')} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="ef-end" className={labelClass}>{t('eventForm.endDate')} *</label>
            <input id="ef-end" type="datetime-local" value={form.endDate} onChange={set('endDate')} required className={inputClass} />
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="ef-category" className={labelClass}>{t('eventForm.category')} *</label>
          <select id="ef-category" value={form.categoryId} onChange={set('categoryId')} required className={inputClass}>
            <option value="">– {t('eventForm.category')} wählen –</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Image URL + Max Participants */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ef-image" className={labelClass}>{t('eventForm.imageUrl')}</label>
            <Input id="ef-image" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." />
          </div>
          <div>
            <label htmlFor="ef-max" className={labelClass}>{t('eventForm.maxParticipants')}</label>
            <Input id="ef-max" type="number" min="1" value={form.maxParticipants} onChange={set('maxParticipants')} />
          </div>
        </div>

        {/* Requires Account */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.requiresAccount} onChange={set('requiresAccount')} className="w-4 h-4 rounded text-primary-600" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{t('eventForm.requiresAccount')}</span>
        </label>

        {/* Accessibility */}
        <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">{t('eventForm.accessibility')}</legend>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(['wheelchairAccessible', 'hearingLoop', 'signLanguage', 'easyLanguage'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[key] as boolean} onChange={set(key)} className="w-4 h-4 rounded text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t(`eventForm.${key}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>{t('eventForm.cancel')}</Button>
          <Button variant="primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t('loading') : t('eventForm.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
