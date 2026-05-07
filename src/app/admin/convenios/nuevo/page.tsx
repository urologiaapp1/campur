import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import ConvenioForm from '@/components/admin/ConvenioForm';

export default async function NuevoConvenioPage() {
  const cats = await db.select().from(categories).orderBy(asc(categories.displayOrder));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo convenio</h1>
      <ConvenioForm categories={cats} />
    </div>
  );
}
