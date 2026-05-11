import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { convenios, categories, convenioImages } from '@/lib/db/schema';
import { desc, eq, and, sql } from 'drizzle-orm';
import ConvenioCard from '@/components/ConvenioCard';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';

function isUrl(s: string) { return s.startsWith('http'); }

export const dynamic = 'force-dynamic';

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
  if (!cat) notFound();

  const [rows, allCats, allImgs] = await Promise.all([
    db
      .select({ convenio: convenios })
      .from(convenios)
      .where(and(
        eq(convenios.active, true),
        sql`(${convenios.categoryId} = ${cat.id} OR ${convenios.categoryIds} @> ${JSON.stringify([cat.id])}::jsonb)`,
      ))
      .orderBy(desc(convenios.views), desc(convenios.createdAt)),
    db.select().from(categories),
    db.select().from(convenioImages).orderBy(convenioImages.displayOrder),
  ]);

  const list = rows.map(r => {
    const conv = r.convenio;
    const catIds: number[] = (conv.categoryIds as number[])?.length
      ? (conv.categoryIds as number[])
      : conv.categoryId ? [conv.categoryId] : [];
    return {
      ...conv,
      category: allCats.find(c => c.id === catIds[0]) ?? null,
      categories: catIds.map(id => allCats.find(c => c.id === id)).filter(Boolean),
      images: allImgs
        .filter(i => i.convenioId === conv.id)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    };
  });

  return (
    <div className="min-h-screen">
      <SiteHeader activeSlug={slug} />

      <div className="bg-blue-700/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          {isUrl(cat.icon)
            /* eslint-disable-next-line @next/next/no-img-element */
            ? <img src={cat.icon} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />
            : <span className="text-2xl">{cat.icon}</span>}
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">{cat.name}</h1>
            <p className="text-blue-200 text-xs">{list.length} convenio{list.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {list.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">{isUrl(cat.icon) ? '🏷️' : cat.icon}</p>
            <p className="text-lg font-medium">No hay convenios en esta categoría aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((c) => (
              <ConvenioCard key={c.id} convenio={c as Parameters<typeof ConvenioCard>[0]['convenio']} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
