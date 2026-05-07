import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { convenios, categories, convenioImages } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import ConvenioForm from '@/components/admin/ConvenioForm';

export default async function EditarConvenioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [[conv], cats, imgs] = await Promise.all([
    db.select().from(convenios).where(eq(convenios.id, Number(id))),
    db.select().from(categories).orderBy(asc(categories.displayOrder)),
    db.select().from(convenioImages).where(eq(convenioImages.convenioId, Number(id))).orderBy(asc(convenioImages.displayOrder)),
  ]);

  if (!conv) notFound();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar convenio</h1>
      <ConvenioForm categories={cats} initial={{ ...conv, images: imgs }} />
    </div>
  );
}
