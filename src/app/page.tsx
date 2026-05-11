import Link from 'next/link';
import { db } from '@/lib/db';
import { convenios, categories, convenioImages, settings } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';

async function getData() {
  const [cats, activeConvenios, allImgs, allSettings] = await Promise.all([
    db.select().from(categories).orderBy(categories.displayOrder, categories.name),
    db.select({ id: convenios.id, title: convenios.title })
      .from(convenios)
      .where(and(eq(convenios.active, true), eq(convenios.status, 'active')))
      .orderBy(desc(convenios.views), desc(convenios.createdAt)),
    db.select().from(convenioImages).orderBy(convenioImages.displayOrder),
    db.select().from(settings),
  ]);

  const settingsMap: Record<string, string> = {};
  allSettings.forEach(s => { settingsMap[s.key] = s.value; });

  const logos = activeConvenios
    .map(c => {
      const img = allImgs.find(i => i.convenioId === c.id);
      return img ? { id: c.id, title: c.title, url: img.url } : null;
    })
    .filter(Boolean) as { id: number; title: string; url: string }[];

  return { cats, logos, settingsMap };
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { cats, logos, settingsMap } = await getData();

  return (
    <div className="min-h-screen">
      <SiteHeader />

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
        {/* Categorías */}
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
      </main>

      {/* Cómo acceder a los beneficios */}
      {settingsMap['como_acceder'] && (
        <section className="max-w-6xl mx-auto px-4 pb-8">
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">ℹ️</span>
              <h2 className="text-lg font-bold text-gray-900">¿Cómo acceder a los beneficios?</h2>
            </div>
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {settingsMap['como_acceder']}
            </div>
          </div>
        </section>
      )}

      {/* Carrusel logos empresas */}
      {logos.length > 0 && (
        <section className="py-8 border-t border-gray-100 bg-white/60 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-center">Empresas adheridas</h2>
          </div>
          <div className="relative overflow-hidden">
            <div className="flex animate-marquee gap-6 w-max">
              {[...logos, ...logos].map((logo, i) => (
                <Link
                  key={i}
                  href={`/convenio/${logo.id}`}
                  className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo.url} alt={logo.title} className="w-full h-full object-cover" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
