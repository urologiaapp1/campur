'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Category { id: number; name: string; icon: string; }

export default function ProponerPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [physicalAddress, setPhysicalAddress] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [proposerName, setProposerName] = useState('');
  const [proposerEmail, setProposerEmail] = useState('');
  const [proposerPhone, setProposerPhone] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/categorias').then(r => r.json()).then(setCats);
  }, []);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (res.ok) {
        const { url } = await res.json();
        setImages(prev => [...prev, url]);
      } else {
        setError('Error al subir la imagen');
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
      const res = await fetch('/api/proponer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          categoryId: categoryId ? Number(categoryId) : null,
          physicalAddress: physicalAddress || null,
          webUrl: webUrl || null,
          instagram: instagram || null,
          proposerName,
          proposerEmail,
          proposerPhone,
          images,
        }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const d = await res.json();
        setError(d.error || 'Error al enviar');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
          <Link href="/">
            <Image src="/logo.png" alt="Campur" width={44} height={44} className="rounded-full border-2 border-white/30" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Proponer un convenio</h1>
            <p className="text-blue-100 text-sm">Tu propuesta será revisada por el equipo</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {sent ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Propuesta enviada!</h2>
            <p className="text-gray-500 mb-6">El equipo revisará tu propuesta y la publicará si cumple los requisitos.</p>
            <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Volver al inicio
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del convenio / empresa *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required
                placeholder="Ej: 20% de descuento en Farmacia Cruz Verde"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del descuento</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder="Describe el descuento, condiciones, qué incluye..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                <option value="">Seleccionar categoría...</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto del logo o producto</label>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {images.map((url, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
                      <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">×</button>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex items-center gap-2 border-2 border-dashed border-gray-200 hover:border-blue-400 text-gray-500 hover:text-blue-600 rounded-xl px-4 py-3 text-sm font-medium transition-colors w-full justify-center disabled:opacity-50">
                {uploading ? '⏳ Subiendo...' : '📷 Subir foto (logo o producto)'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ''; }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección física</label>
                <input value={physicalAddress} onChange={e => setPhysicalAddress(e.target.value)}
                  placeholder="Ej: Av. Alemania 123, Temuco"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sitio web</label>
                <input value={webUrl} onChange={e => setWebUrl(e.target.value)} type="url"
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <span className="px-3 text-gray-400 text-sm">@</span>
                <input value={instagram} onChange={e => setInstagram(e.target.value.replace('@', ''))}
                  placeholder="nombre_de_usuario"
                  className="flex-1 py-2.5 pr-3 text-sm bg-transparent focus:outline-none" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-800 mb-3">Tus datos de contacto *</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nombre completo *</label>
                  <input value={proposerName} onChange={e => setProposerName(e.target.value)} required
                    placeholder="Tu nombre"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Correo electrónico *</label>
                    <input value={proposerEmail} onChange={e => setProposerEmail(e.target.value)} required type="email"
                      placeholder="email@ejemplo.com"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Teléfono *</label>
                    <input value={proposerPhone} onChange={e => setProposerPhone(e.target.value)} required type="tel"
                      placeholder="+56 9 1234 5678"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
              {saving ? 'Enviando...' : 'Enviar propuesta'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
