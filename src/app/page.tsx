import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { convenios, categories, convenioImages } from '@/lib/db/schema';
import { desc, eq, and, or, ilike } from 'drizzle-orm';
import ConvenioCard from '@/components/ConvenioCard';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';

async function getData(q?: string) {
  const [cats, topConvenios] = await Promise.all([
    db.select().from(categories).orderBy(categories.displayOrder, categories.name),
    db
      .select({ convenio: convenios, category: categories })
      .from(convenios)
      .leftJoin(categories, eq(convenios.categoryId, categories.id))
      .where(and(
        eq(convenios.active, true),
        eq(convenios.status, 'active'),
        q ? or(
          ilike(convenios.title, `%${q}%`),
          ilike(convenios.description, `%${q}%`),
          ilike(convenios.discountText, `%${q}%`),
          ilike(convenios.physicalAddress, `%${q}%`),
        ) : undefined,
      ))
      .orderBy(desc(convenios.views), desc(convenios.createdAt))
      .limit(24),
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

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { cats, convenioList } = await getData(q);

  return (
    <div className="min-h-screen">
      <header className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Campur" width={52} height={52} className="rounded-full border-2 border-white/30" />
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-tight">Beneficios Club Pumahue</h1>
                <p className="text-blue-100 text-xs mt-0.5">Campur General de Padres · Temuco</p>
              </div>
            </div>
            <Link
              href="/proponer"
              className="flex items-center gap-2 bg-white text-blue-600 font-bold text-sm px-4 py-2 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
            >
              ✉️ Proponer convenio
            </Link>
          </div>

          {/* Buscador */}
          <SearchBar initialValue={q ?? ''} />

          {/* Categorías nav */}
          {cats.length > 0 && (
            <nav className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {cats.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  {cat.icon.startsWith('http')
                    /* eslint-disable-next-line @next/next/no-img-element */
                    ? <img src={cat.icon} alt="" className="w-4 h-4 rounded object-cover" />
                    : <span>{cat.icon}</span>}
                  <span>{cat.name}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Instagram banner */}
      <a
        href="https://instagram.com/campur.gral.pumahue.temuco"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white"
      >
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
          <span className="text-sm font-semibold">Síguenos en Instagram</span>
          <span className="text-sm font-bold">@campur.gral.pumahue.temuco</span>
          <span className="text-white/70 text-sm">→</span>
        </div>
      </a>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!q && cats.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Categorías</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {cats.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center"
                >
                  {cat.icon.startsWith('http')
                    /* eslint-disable-next-line @next/next/no-img-element */
                    ? <img src={cat.icon} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />
                    : <span className="text-3xl">{cat.icon}</span>}
                  <span className="text-sm font-semibold text-gray-700 leading-tight">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          {q && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                {convenioList.length} resultado{convenioList.length !== 1 ? 's' : ''} para &ldquo;{q}&rdquo;
              </h2>
              <Link href="/" className="text-sm text-blue-600 hover:underline">Limpiar búsqueda</Link>
            </div>
          )}

          {!q && convenioList.length > 0 && (
            <h2 className="text-lg font-bold text-gray-800 mb-4">Convenios destacados</h2>
          )}

          {convenioList.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">{q ? '🔍' : '🏷️'}</p>
              <p className="text-lg font-medium">
                {q ? `Sin resultados para "${q}"` : 'Próximamente convenios disponibles'}
              </p>
              {q && <Link href="/" className="text-blue-600 text-sm mt-2 inline-block hover:underline">Ver todos</Link>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {convenioList.map((c) => (
                <ConvenioCard key={c.id} convenio={c} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
