import Link from 'next/link';
import { db } from '@/lib/db';
import { convenios, categories, convenioImages } from '@/lib/db/schema';
import { desc, eq, or } from 'drizzle-orm';
import DeleteButton from './DeleteButton';
import ApproveButton from './ApproveButton';

export const dynamic = 'force-dynamic';

export default async function ConveniosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const isPending = tab === 'pending';

  const rows = await db
    .select({ convenio: convenios, category: categories })
    .from(convenios)
    .leftJoin(categories, eq(convenios.categoryId, categories.id))
    .where(isPending ? eq(convenios.status, 'pending') : or(eq(convenios.status, 'active'), eq(convenios.status, 'inactive')))
    .orderBy(desc(convenios.createdAt));

  const ids = rows.map((r) => r.convenio.id);
  const imgs = ids.length ? await db.select().from(convenioImages) : [];

  const list = rows.map((r) => ({
    ...r.convenio,
    category: r.category,
    cover: imgs.find((i) => i.convenioId === r.convenio.id)?.url ?? null,
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Convenios</h1>
        <Link
          href="/admin/convenios/nuevo"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          ➕ Nuevo convenio
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Link
          href="/admin/convenios"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!isPending ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Activos / Inactivos
        </Link>
        <Link
          href="/admin/convenios?tab=pending"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isPending ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          ⏳ Propuestas pendientes
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">{isPending ? '⏳' : '🏷️'}</p>
          <p className="font-medium">{isPending ? 'No hay propuestas pendientes' : 'No hay convenios aún'}</p>
          {!isPending && (
            <Link href="/admin/convenios/nuevo" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
              Crear el primero
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Convenio</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Categoría</th>
                {isPending && <th className="text-left px-4 py-3 text-gray-500 font-semibold">Propuesto por</th>}
                {!isPending && <th className="text-left px-4 py-3 text-gray-500 font-semibold">Estado</th>}
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Vistas</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.cover} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                          🏷️
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{c.title}</div>
                        {c.discountText && <div className="text-xs text-blue-600 font-medium">{c.discountText}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.category ? `${c.category.icon} ${c.category.name}` : '—'}
                  </td>
                  {isPending && (
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {c.proposerName && <div className="font-medium text-gray-700">{c.proposerName}</div>}
                      {c.proposerEmail && <div>{c.proposerEmail}</div>}
                      {c.proposerPhone && <div>{c.proposerPhone}</div>}
                      {!c.proposerName && !c.proposerEmail && <span className="italic">Anónimo</span>}
                    </td>
                  )}
                  {!isPending && (
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-500">{c.views}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {isPending && <ApproveButton id={c.id} />}
                      <Link href={`/admin/convenios/${c.id}/editar`} className="text-xs font-medium text-blue-600 hover:underline">
                        Editar
                      </Link>
                      <DeleteButton id={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
