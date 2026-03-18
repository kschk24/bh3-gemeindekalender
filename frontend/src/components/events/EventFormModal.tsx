import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { eventsService, categoriesService } from '../../services/api';
import { Event } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

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

  const fieldClass = 'w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-colors';
  const labelClass = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5';
  const sectionClass = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('eventForm.editTitle') : t('eventForm.createTitle')}
      titleId="event-form-title"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Basic info */}
        <div className={sectionClass}>
          <div>
            <label htmlFor="ef-title" className={labelClass}>{t('eventForm.title')} <span className="text-red-500">*</span></label>
            <input id="ef-title" value={form.title} onChange={set('title')} required className={fieldClass} placeholder="z.B. Gemeindefest 2026" />
          </div>
          <div>
            <label htmlFor="ef-desc" className={labelClass}>{t('eventForm.description')} <span className="text-red-500">*</span></label>
            <textarea id="ef-desc" value={form.description} onChange={set('description')} required rows={3} className={fieldClass} placeholder="Beschreiben Sie die Veranstaltung..." />
          </div>
          <div>
            <label htmlFor="ef-category" className={labelClass}>{t('eventForm.category')} <span className="text-red-500">*</span></label>
            <select id="ef-category" value={form.categoryId} onChange={set('categoryId')} required className={fieldClass}>
              <option value="">– Kategorie wählen –</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div className={sectionClass}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ef-location" className={labelClass}>{t('eventForm.location')} <span className="text-red-500">*</span></label>
              <input id="ef-location" value={form.location} onChange={set('location')} required className={fieldClass} placeholder="z.B. Bürgerhaus" />
            </div>
            <div>
              <label htmlFor="ef-address" className={labelClass}>{t('eventForm.address')} <span className="text-red-500">*</span></label>
              <input id="ef-address" value={form.address} onChange={set('address')} required className={fieldClass} placeholder="z.B. Hauptstraße 1" />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className={sectionClass}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ef-start" className={labelClass}>{t('eventForm.startDate')} <span className="text-red-500">*</span></label>
              <input id="ef-start" type="datetime-local" value={form.startDate} onChange={set('startDate')} required className={fieldClass} />
            </div>
            <div>
              <label htmlFor="ef-end" className={labelClass}>{t('eventForm.endDate')} <span className="text-red-500">*</span></label>
              <input id="ef-end" type="datetime-local" value={form.endDate} onChange={set('endDate')} required className={fieldClass} />
            </div>
          </div>
        </div>

        {/* Optional settings */}
        <div className={sectionClass}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ef-image" className={labelClass}>{t('eventForm.imageUrl')}</label>
              <input id="ef-image" value={form.imageUrl} onChange={set('imageUrl')} className={fieldClass} placeholder="https://..." />
            </div>
            <div>
              <label htmlFor="ef-max" className={labelClass}>{t('eventForm.maxParticipants')}</label>
              <input id="ef-max" type="number" min="1" value={form.maxParticipants} onChange={set('maxParticipants')} className={fieldClass} placeholder="Unbegrenzt" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer py-1">
            <input type="checkbox" checked={form.requiresAccount} onChange={set('requiresAccount')} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('eventForm.requiresAccount')}</span>
          </label>
        </div>

        {/* Accessibility */}
        <div className={sectionClass}>
          <p className={labelClass}>{t('eventForm.accessibility')}</p>
          <div className="grid grid-cols-2 gap-3">
            {(['wheelchairAccessible', 'hearingLoop', 'signLanguage', 'easyLanguage'] as const).map((key) => (
              <label key={key} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input type="checkbox" checked={form[key] as boolean} onChange={set(key)} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t(`eventForm.${key}`)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1 pb-1">
          <Button variant="outline" type="button" onClick={onClose}>{t('eventForm.cancel')}</Button>
          <Button variant="primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t('loading') : t('eventForm.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
