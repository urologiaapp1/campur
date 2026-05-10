import Link from 'next/link';
import Image from 'next/image';
import type { Convenio, Category, ConvenioImage } from '@/lib/db/schema';

interface Props {
  convenio: Convenio & {
    category: Category | null;
    categories?: Category[];
    images: ConvenioImage[];
  };
}

const DAYS_ES: Record<string, string> = {
  lunes: 'Lun', martes: 'Mar', miércoles: 'Mié',
  jueves: 'Jue', viernes: 'Vie', sábado: 'Sáb', domingo: 'Dom',
};

function formatDate(d: string | null) {
  if (!d) return null;
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function isUrl(s: string) { return s.startsWith('http'); }

function CategoryBadge({ cat }: { cat: Category }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: cat.color + '20', color: cat.color }}
    >
      {isUrl(cat.icon)
        ? <Image src={cat.icon} alt="" width={12} height={12} className="w-3 h-3 rounded object-cover" />
        : <span>{cat.icon}</span>}
      {cat.name}
    </span>
  );
}

export default function ConvenioCard({ convenio }: Props) {
  const coverImg = convenio.images[0]?.url;
  const periods = (convenio.periods ?? []) as string[];
  const start = formatDate(convenio.startDate);
  const end = formatDate(convenio.endDate);
  const cats = convenio.categories?.length ? convenio.categories : convenio.category ? [convenio.category] : [];

  return (
    <Link href={`/convenio/${convenio.id}`} className="group block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
      <div className="relative aspect-video bg-gray-50">
        {coverImg ? (
          <Image src={coverImg} alt={convenio.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {cats[0] && isUrl(cats[0].icon)
              ? <Image src={cats[0].icon} alt="" width={64} height={64} className="w-16 h-16 object-cover rounded-xl opacity-40" />
              : <span className="text-4xl opacity-50">{cats[0]?.icon ?? '🏷️'}</span>}
          </div>
        )}
        {convenio.discountText && (
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {convenio.discountText}
          </span>
        )}
      </div>

      <div className="p-4">
        {cats.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {cats.map(cat => <CategoryBadge key={cat.id} cat={cat} />)}
          </div>
        )}

        <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{convenio.title}</h3>

        {convenio.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{convenio.description}</p>
        )}

        <div className="flex flex-wrap gap-1 mb-2">
          {periods.map(p => (
            <span key={p} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              {DAYS_ES[p] ?? p}
            </span>
          ))}
        </div>

        {(start || end) && (
          <p className="text-xs text-gray-400">
            {start && end ? `${start} – ${end}` : start ? `Desde ${start}` : `Hasta ${end}`}
          </p>
        )}
      </div>
    </Link>
  );
}
