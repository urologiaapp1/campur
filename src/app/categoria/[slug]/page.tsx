import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { convenios, categories, convenioImages } from '@/lib/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import ConvenioCard from '@/components/ConvenioCard';
import CategoriesNav from '@/components/CategoriesNav';
import Footer from '@/components/Footer';

function isUrl(s: string) { return s.startsWith('http'); }

export const revalidate = 60;

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
  if (!cat) notFound();

  const rows = await db
    .select({ convenio: convenios, category: categories })
    .from(convenios)
    .leftJoin(categories, eq(convenios.categoryId, categories.id))
    .where(and(eq(convenios.active, true), eq(convenios.categoryId, cat.id)))
    .orderBy(desc(convenios.views), desc(convenios.createdAt));

  const ids = rows.map((r) => r.convenio.id);
  const imgs = ids.length ? await db.select().from(convenioImages) : [];

  const list = rows.map((r) => ({
    ...r.convenio,
    category: r.category,
    images: imgs
      .filter((i) => i.convenioId === r.convenio.id)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  }));

  return (
    <div className="min-h-screen">
      <header className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-100 text-sm hover:text-white mb-2 inline-block">
            ← Volver
          </Link>
          <div className="flex items-center gap-3 mb-1">
            {isUrl(cat.icon)
              /* eslint-disable-next-line @next/next/no-img-element */
              ? <img src={cat.icon} alt={cat.name} className="w-10 h-10 rounded-xl object-cover" />
              : <span className="text-4xl">{cat.icon}</span>}
            <div>
              <h1 className="text-2xl font-bold">{cat.name}</h1>
              <p className="text-blue-100 text-sm">{list.length} convenio{list.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <CategoriesNav activeSlug={slug} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {list.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">{cat.icon}</p>
            <p className="text-lg font-medium">No hay convenios en esta categoría aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((c) => (
              <ConvenioCard key={c.id} convenio={c} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
