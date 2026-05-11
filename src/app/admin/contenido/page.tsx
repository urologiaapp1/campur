'use client';
import { useEffect, useState } from 'react';

export default function ContenidoPage() {
  const [texto, setTexto] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then((d: Record<string, string>) => {
      setTexto(d['como_acceder'] ?? '');
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ como_acceder: texto }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Contenido editable</h1>
      <p className="text-sm text-gray-500 mb-6">Este texto aparece en la página principal bajo la sección &ldquo;¿Cómo acceder a los beneficios?&rdquo;</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">¿Cómo acceder a los beneficios?</label>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            rows={10}
            placeholder="Ej: Para acceder a los beneficios debes presentar tu carnet de socio vigente en el establecimiento. Los descuentos aplican solo a socios activos del Centro General de Padres Colegio Pumahue Temuco..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">Puedes usar saltos de línea para separar párrafos.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && <span className="text-green-600 text-sm font-medium">✓ Guardado</span>}
        </div>
      </div>
    </div>
  );
}
