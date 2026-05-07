import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { convenios, categories, convenioImages } from '@/lib/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import ConvenioCard from '@/components/ConvenioCard';

async function getData() {
  const [cats, topConvenios] = await Promise.all([
    db.select().from(categories).orderBy(categories.displayOrder, categories.name),
    db
      .select({ convenio: convenios, category: categories })
      .from(convenios)
      .leftJoin(categories, eq(convenios.categoryId, categories.id))
      .where(and(eq(convenios.active, true)))
      .orderBy(desc(convenios.views), desc(convenios.createdAt))
      .limit(12),
  ]);

  const ids = topConvenios.map((r) => r.convenio.id);
  const imgs = ids.length ? await db.select().from(convenioImages) : [];

  const convenioList = topConvenios.map((r) => ({
    ...r.convenio,
    category: r.category,
    images: imgs
      .filter((i) => i.convenioId === r.convenio.id)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  }));

  return { cats, convenioList };
}

export const revalidate = 60;

export default async function HomePage() {
  const { cats, convenioList } = await getData();

  return (
    <div className="min-h-screen">
      <header className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Campur" width={52} height={52} className="rounded-full border-2 border-white/30" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Campur</h1>
              <p className="text-blue-100 text-sm mt-0.5">Convenios y descuentos</p>
            </div>
          </div>
          {cats.length > 0 && (
            <nav className="flex gap-2 mt-5 overflow-x-auto pb-1">
              {cats.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {cats.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Categorías</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {cats.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center"
                >
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-sm font-semibold text-gray-700 leading-tight">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          {convenioList.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🏷️</p>
              <p className="text-lg font-medium">Próximamente convenios disponibles</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Convenios destacados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {convenioList.map((c) => (
                  <ConvenioCard key={c.id} convenio={c} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
