'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, Convenio, ConvenioImage } from '@/lib/db/schema';

const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

interface Props {
  categories: Category[];
  initial?: Convenio & { images: ConvenioImage[] };
}

export default function ConvenioForm({ categories, initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [discountText, setDiscountText] = useState(initial?.discountText ?? '');
  const [startDate, setStartDate] = useState(initial?.startDate ?? '');
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [periods, setPeriods] = useState<string[]>((initial?.periods as string[]) ?? []);
  const [physicalAddress, setPhysicalAddress] = useState(initial?.physicalAddress ?? '');
  const [webUrl, setWebUrl] = useState(initial?.webUrl ?? '');
  const [instagram, setInstagram] = useState(initial?.instagram ?? '');
  const [categoryIds, setCategoryIds] = useState<number[]>(() => {
    const ids = initial?.categoryIds as number[] | undefined;
    if (ids?.length) return ids;
    if (initial?.categoryId) return [initial.categoryId];
    return [];
  });
  const [active, setActive] = useState(initial?.active ?? true);
  const [images, setImages] = useState<string[]>(initial?.images.map((i) => i.url) ?? []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggleDay(day: string) {
    setPeriods((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  }

  function addImageUrl() {
    const url = newImageUrl.trim();
    if (url && !images.includes(url)) {
      setImages((prev) => [...prev, url]);
      setNewImageUrl('');
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (res.ok) {
        const { url } = await res.json();
        setImages((prev) => [...prev, url]);
      } else {
        const { error: msg } = await res.json();
        setError(msg || 'Error al subir imagen');
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = {
        title, description, discountText, startDate, endDate,
        periods, physicalAddress, webUrl, instagram,
        categoryId: categoryIds[0] ?? null,
        categoryIds,
        active, images,
      };
      const url = isEdit ? `/api/convenios/${initial!.id}` : '/api/convenios';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        router.push('/admin/convenios');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Ej: 20% de descuento en Restaurante El Parron"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
      </div>

      {/* Descuento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Texto de descuento</label>
        <input
          value={discountText}
          onChange={(e) => setDiscountText(e.target.value)}
          placeholder="Ej: 20% dcto, 2x1"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
      </div>

      {/* Categorías (hasta 3) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categorías <span className="text-gray-400 font-normal">(hasta 3)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const selected = categoryIds.includes(c.id);
            const disabled = !selected && categoryIds.length >= 3;
            return (
              <button
                key={c.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setCategoryIds(prev =>
                    prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                  );
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors
                  ${selected ? 'text-white border-transparent' : disabled ? 'opacity-30 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}
                style={selected ? { backgroundColor: c.color, borderColor: c.color } : {}}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
                {selected && <span className="ml-0.5">✓</span>}
              </button>
            );
          })}
        </div>
        {categoryIds.length === 0 && (
          <p className="text-xs text-gray-400 mt-1">Sin categoría asignada</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Descripción detallada del convenio..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
        />
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha término</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>
      </div>

      {/* Días válidos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Días válidos</label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                periods.includes(day)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Direcciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección física</label>
        <input
          value={physicalAddress}
          onChange={(e) => setPhysicalAddress(e.target.value)}
          placeholder="Ej: Av. Providencia 1234, Santiago"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sitio web</label>
        <input
          value={webUrl}
          onChange={(e) => setWebUrl(e.target.value)}
          placeholder="https://..."
          type="url"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          <span className="px-3 text-gray-400 text-sm">@</span>
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
            placeholder="nombre_de_usuario"
            className="flex-1 py-2.5 pr-3 text-sm bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Imágenes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes</label>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((url, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`img ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="URL de imagen..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
          />
          <button
            type="button"
            onClick={addImageUrl}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
          >
            Agregar URL
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {uploading ? '...' : '📤 Subir'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ''; }}
          />
        </div>
      </div>

      {/* Activo */}
      <div className="flex items-center gap-2">
        <input
          id="active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="w-4 h-4 accent-blue-600"
        />
        <label htmlFor="active" className="text-sm font-medium text-gray-700">Publicado (visible al público)</label>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear convenio'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
