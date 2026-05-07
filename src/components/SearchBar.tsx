'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : '/');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Buscar convenios, tiendas, descuentos..."
        className="flex-1 bg-white/20 placeholder-blue-200 text-white border border-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-white/30"
      />
      <button
        type="submit"
        className="bg-white text-blue-600 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors flex-shrink-0"
      >
        🔍 Buscar
      </button>
    </form>
  );
}
