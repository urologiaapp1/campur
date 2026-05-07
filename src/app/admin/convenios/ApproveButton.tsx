'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ApproveButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    await fetch(`/api/convenios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active', active: true }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="text-xs font-medium text-green-600 hover:underline disabled:opacity-50"
    >
      ✅ Aprobar
    </button>
  );
}
