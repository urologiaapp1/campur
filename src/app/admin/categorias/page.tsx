'use client';
import { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  displayOrder: number;
}

const PRESET_ICONS = ['🍽️', '👟', '🐾', '💆', '🛍️', '🏠', '🎬', '🏥', '🚗', '✈️', '💻', '📚', '🎮', '💊', '🏋️', '🌿'];

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
  const [error, setError] = useState('');

  function handleNameChange(v: string) {
    setName(v);
    if (!cat?.id) setSlug(toSlug(v));
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{cat?.id ? 'Editar categoría' : 'Nueva categoría'}</h2>
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input value={name} onChange={(e) => handleNameChange(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ícono</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  className={`text-xl p-1.5 rounded-lg ${icon === ic ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}>
                  {ic}
                </button>
              ))}
            </div>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2} className="w-16 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                <span className="text-sm text-gray-500 font-mono">{color}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={saving || !name}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
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
        <button
          onClick={() => setModal({})}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
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
              {cats.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{c.icon}</span>
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
        <CategoryModal
          cat={modal || null}
          onSave={load}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}
