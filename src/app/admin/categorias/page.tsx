'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  displayOrder: number;
}

const PRESET_ICONS = [
  '🍽️','🍔','🍕','🍣','☕','🍰','🥗','🍷',
  '👟','⚽','🏋️','🚴','🎾','🏊','🥊','🎿',
  '🐾','🐶','🐱','🐟','🌿','🦮','🐠','🐹',
  '💆','💅','✂️','🧴','💄','🪥','🧖','🛁',
  '🛍️','👗','👠','🎒','⌚','💍','🕶️','👒',
  '🏠','🛋️','🪴','🔨','💡','🛏️','🪟','🚿',
  '🎬','🎮','🎵','🎨','📚','🎭','🎪','🎡',
  '🏥','💊','🩺','🦷','👓','🧬','💉','🩹',
  '🚗','✈️','🚢','🏨','🗺️','🧳','🚌','🚁',
  '💻','📱','🖨️','🎧','📷','🖥️','⌨️','🖱️',
  '🏦','💰','📊','🏢','📋','🧾','💳','🏷️',
  '🎓','📐','🔬','🧪','📝','🖊️','📖','🎯',
];

function isUrl(s: string) {
  return s.startsWith('http');
}

function toSlug(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function CategoryModal({ cat, onSave, onClose }: {
  cat: Partial<Category> | null;
  onSave: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(cat?.name ?? '');
  const [slug, setSlug] = useState(cat?.slug ?? '');
  const [icon, setIcon] = useState(cat?.icon ?? '🏷️');
  const [color, setColor] = useState(cat?.color ?? '#2563eb');
  const [order, setOrder] = useState(cat?.displayOrder ?? 0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleNameChange(v: string) {
    setName(v);
    if (!cat?.id) setSlug(toSlug(v));
  }

  async function uploadIcon(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (res.ok) {
        const { url } = await res.json();
        setIcon(url);
      } else {
        setError('Error al subir imagen');
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      const body = { name, slug, icon, color, displayOrder: order };
      const res = cat?.id
        ? await fetch(`/api/categorias/${cat.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/categorias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { onSave(); onClose(); }
      else { const d = await res.json(); setError(d.error || 'Error'); }
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{cat?.id ? 'Editar categoría' : 'Nueva categoría'}</h2>
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input value={name} onChange={e => handleNameChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input value={slug} onChange={e => setSlug(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-mono" />
          </div>

          {/* Ícono actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ícono actual</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                {isUrl(icon)
                  ? <Image src={icon} alt="icono" width={48} height={48} className="w-full h-full object-cover" />
                  : <span className="text-2xl">{icon}</span>
                }
              </div>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex items-center gap-2 border border-dashed border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600 rounded-xl px-3 py-2 text-sm transition-colors disabled:opacity-50">
                {uploading ? '⏳ Subiendo...' : '📤 Subir imagen'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadIcon(f); e.target.value = ''; }} />
            </div>
          </div>

          {/* Emojis preset */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">O elegir emoji</label>
            <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50">
              {PRESET_ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  className={`text-xl p-1.5 rounded-lg transition-colors hover:bg-white ${icon === ic && !isUrl(icon) ? 'bg-white ring-2 ring-blue-400' : ''}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                <span className="text-sm text-gray-500 font-mono">{color}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={saving || !name}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryIcon({ icon }: { icon: string }) {
  if (isUrl(icon)) return <Image src={icon} alt="icono" width={28} height={28} className="w-7 h-7 rounded object-cover" />;
  return <span className="text-xl">{icon}</span>;
}

export default function CategoriasPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [modal, setModal] = useState<Partial<Category> | null | false>(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch('/api/categorias');
    setCats(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
          ➕ Nueva categoría
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : cats.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📂</p>
          <p className="font-medium">No hay categorías aún</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Categoría</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Slug</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Orden</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cats.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CategoryIcon icon={c.icon} />
                      <span className="font-medium text-gray-900">{c.name}</span>
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono">{c.slug}</td>
                  <td className="px-4 py-3 text-gray-500">{c.displayOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <button onClick={() => setModal(c)} className="text-xs font-medium text-blue-600 hover:underline">Editar</button>
                      <button onClick={() => handleDelete(c.id)} className="text-xs font-medium text-red-500 hover:underline">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== false && (
        <CategoryModal cat={modal || null} onSave={load} onClose={() => setModal(false)} />
      )}
    </div>
  );
}
