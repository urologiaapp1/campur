'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('¿Eliminar este convenio?')) return;
    setLoading(true);
    await fetch(`/api/convenios/${id}`, { method: 'DELETE' });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
    >
      Eliminar
    </button>
  );
}
