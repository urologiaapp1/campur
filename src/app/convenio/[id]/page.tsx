import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { convenios, categories, convenioImages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Carousel from '@/components/Carousel';
import Footer from '@/components/Footer';

const DAYS_ES: Record<string, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miércoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sábado: 'Sábado',
  domingo: 'Domingo',
};

function formatDate(d: string | null) {
  if (!d) return null;
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default async function ConvenioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [row] = await db
    .select({ convenio: convenios, category: categories })
    .from(convenios)
    .leftJoin(categories, eq(convenios.categoryId, categories.id))
    .where(eq(convenios.id, Number(id)));

  if (!row || !row.convenio.active) notFound();

  const imgs = await db
    .select()
    .from(convenioImages)
    .where(eq(convenioImages.convenioId, Number(id)))
    .orderBy(convenioImages.displayOrder);

  // Increment views (fire and forget)
  db.update(convenios)
    .set({ views: (row.convenio.views ?? 0) + 1 })
    .where(eq(convenios.id, Number(id)))
    .catch(() => {});

  const { convenio, category } = row;
  const periods = (convenio.periods ?? []) as string[];
  const start = formatDate(convenio.startDate);
  const end = formatDate(convenio.endDate);

  return (
    <div className="min-h-screen">
      <header className="bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-100 text-sm hover:text-white">
            ← Volver a convenios
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Carousel */}
          <div className="p-4 pb-0">
            <Carousel images={imgs} title={convenio.title} />
          </div>

          <div className="p-6">
            {/* Category + discount badge */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {category && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: category.color + '20', color: category.color }}
                >
                  {category.icon} {category.name}
                </span>
              )}
              {convenio.discountText && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {convenio.discountText}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">{convenio.title}</h1>

            {convenio.description && (
              <p className="text-gray-600 leading-relaxed mb-5">{convenio.description}</p>
            )}

            {/* Info grid */}
            <div className="space-y-4">
              {(start || end) && (
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📅</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Período</p>
                    <p className="text-gray-700 font-medium">
                      {start && end ? `${start} hasta ${end}` : start ? `Desde ${start}` : `Hasta ${end}`}
                    </p>
                  </div>
                </div>
              )}

              {periods.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">🗓️</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Días válidos</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {periods.map((p) => (
                        <span key={p} className="bg-blue-50 text-blue-700 text-sm font-medium px-2 py-0.5 rounded-full">
                          {DAYS_ES[p] ?? p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {convenio.physicalAddress && (
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📍</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Dirección</p>
                    <p className="text-gray-700">{convenio.physicalAddress}</p>
                  </div>
                </div>
              )}

              {convenio.webUrl && (
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">🌐</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sitio web</p>
                    <a href={convenio.webUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {convenio.webUrl}
                    </a>
                  </div>
                </div>
              )}

              {convenio.instagram && (
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📸</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Instagram</p>
                    <a
                      href={`https://instagram.com/${convenio.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      @{convenio.instagram.replace('@', '')}
                    </a>
                  </div>
                </div>
              )}

              {convenio.catalogUrl && (
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📋</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Catálogo digital</p>
                    <a
                      href={convenio.catalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      Ver catálogo
                    </a>
                  </div>
                </div>
              )}

              {convenio.contactPhone && (
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📞</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Teléfono / WhatsApp</p>
                    <a
                      href={`https://wa.me/${convenio.contactPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline font-medium"
                    >
                      {convenio.contactPhone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {convenio.webUrl && (
              <a
                href={convenio.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Visitar sitio web →
              </a>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
